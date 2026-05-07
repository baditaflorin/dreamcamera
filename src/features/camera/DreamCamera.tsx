import {
  Aperture,
  BadgeDollarSign,
  Camera,
  CircleStop,
  Github,
  Image,
  Loader2,
  Moon,
  Music2,
  ScanFace,
  Sparkles,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../../components/IconButton";
import { useToast } from "../../components/ToastProvider";
import { messageFromError } from "../../lib/errors";
import { DreamAudioEngine } from "../audio/dreamAudio";
import { FrameAnalyzer } from "./cameraAnalysis";
import { createDreamRenderer, featureSummary } from "../rendering/renderer";
import type { DreamRenderer } from "../rendering/types";
import { MediaPipeSegmenter } from "../mediapipe/segmentation";
import {
  loadSingleOnnxStylizer,
  warmTurboRuntime,
  type TurboRuntimeInfo,
} from "../onnx/turboSession";
import {
  appCommit,
  appVersion,
  paypalUrl,
  repoUrl,
  shortCommit,
} from "../version/buildInfo";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
} from "./preferences";
import type { CameraPreferences, DreamStyle, RuntimeState } from "./types";

const styles: Array<{ id: DreamStyle; label: string; icon: typeof Sparkles }> =
  [
    { id: "dream", label: "Dream", icon: Sparkles },
    { id: "charcoal", label: "Charcoal", icon: Aperture },
    { id: "albumen", label: "Albumen", icon: Image },
  ];

export function DreamCamera() {
  const { notify } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rendererRef = useRef<DreamRenderer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<DreamAudioEngine | null>(null);
  const analyzerRef = useRef(new FrameAnalyzer());
  const segmenterRef = useRef<MediaPipeSegmenter | null>(null);
  const segmenterBusyRef = useRef(false);
  const lastSegmentRef = useRef(0);
  const segmentationStrengthRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsWindowRef = useRef(performance.now());
  const settingsRef = useRef<CameraPreferences>(defaultPreferences);

  const [preferences, setPreferences] = useState<CameraPreferences>(() =>
    loadPreferences(),
  );
  const [cameraState, setCameraState] = useState<RuntimeState>("idle");
  const [rendererKind, setRendererKind] = useState("not started");
  const [fps, setFps] = useState(0);
  const [segmentationState, setSegmentationState] =
    useState<RuntimeState>("idle");
  const [turboState, setTurboState] = useState<RuntimeState>("idle");
  const [turboInfo, setTurboInfo] = useState<TurboRuntimeInfo | null>(null);

  settingsRef.current = preferences;

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const rendererStatus = useMemo(() => {
    if (cameraState === "idle") {
      return featureSummary();
    }
    return rendererKind;
  }, [cameraState, rendererKind]);

  const updatePreferences = useCallback((next: Partial<CameraPreferences>) => {
    setPreferences((current) => ({
      ...current,
      ...next,
    }));
  }, []);

  const stopCamera = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
    segmenterRef.current?.close();
    segmenterRef.current = null;
    audioRef.current?.stop();
    setCameraState("idle");
    setRendererKind("not started");
    setFps(0);
    setSegmentationState("idle");
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;

    if (
      !video ||
      !canvas ||
      !renderer ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const now = performance.now();
    const rect = canvas.getBoundingClientRect();
    renderer.resize(
      rect.width,
      rect.height,
      Math.min(window.devicePixelRatio || 1, 2),
    );

    if (
      settingsRef.current.segmentation &&
      segmenterRef.current &&
      !segmenterBusyRef.current &&
      now - lastSegmentRef.current > 140
    ) {
      segmenterBusyRef.current = true;
      lastSegmentRef.current = now;
      const result = segmenterRef.current.segment(video, now);
      segmentationStrengthRef.current = result.strength;
      segmenterBusyRef.current = false;
    }

    renderer.draw(video, {
      style: settingsRef.current.style,
      intensity: settingsRef.current.intensity,
      time: now / 1000,
      segmentationStrength: segmentationStrengthRef.current,
    });

    const mood = analyzerRef.current.sample(
      video,
      settingsRef.current.style,
      settingsRef.current.intensity,
      now,
    );
    if (mood && settingsRef.current.ambience) {
      audioRef.current?.update(mood);
    }

    frameCountRef.current += 1;
    if (now - fpsWindowRef.current > 700) {
      setFps(
        Math.round(
          (frameCountRef.current * 1000) / (now - fpsWindowRef.current),
        ),
      );
      frameCountRef.current = 0;
      fpsWindowRef.current = now;
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      notify("This browser does not expose camera capture.");
      return;
    }

    setCameraState("loading");

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        throw new Error("Camera surface is not ready.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const renderer = await createDreamRenderer(canvas);
      rendererRef.current = renderer;
      setRendererKind(renderer.kind);
      setCameraState("ready");

      if (settingsRef.current.ambience && !audioRef.current) {
        audioRef.current = new DreamAudioEngine();
        await audioRef.current.start();
      }

      if (settingsRef.current.segmentation) {
        void ensureSegmentation();
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    } catch (error) {
      setCameraState("error");
      notify(messageFromError(error));
      stopCamera();
    }
  }, [notify, renderFrame, stopCamera]);

  const ensureSegmentation = useCallback(async () => {
    if (segmenterRef.current || segmentationState === "loading") {
      return;
    }

    setSegmentationState("loading");
    try {
      segmenterRef.current = await MediaPipeSegmenter.create();
      setSegmentationState("ready");
    } catch (error) {
      updatePreferences({ segmentation: false });
      setSegmentationState("error");
      notify(`MediaPipe could not start: ${messageFromError(error)}`);
    }
  }, [notify, segmentationState, updatePreferences]);

  const toggleSegmentation = useCallback(async () => {
    const next = !settingsRef.current.segmentation;
    updatePreferences({ segmentation: next });
    if (next) {
      await ensureSegmentation();
    } else {
      segmentationStrengthRef.current = 0;
      segmenterRef.current?.close();
      segmenterRef.current = null;
      setSegmentationState("idle");
    }
  }, [ensureSegmentation, updatePreferences]);

  const toggleAmbience = useCallback(async () => {
    const next = !settingsRef.current.ambience;
    updatePreferences({ ambience: next });

    if (next) {
      audioRef.current ??= new DreamAudioEngine();
      try {
        await audioRef.current.start();
      } catch (error) {
        updatePreferences({ ambience: false });
        notify(`Audio could not start: ${messageFromError(error)}`);
      }
    } else {
      audioRef.current?.stop();
    }
  }, [notify, updatePreferences]);

  const warmTurbo = useCallback(async () => {
    setTurboState("loading");
    try {
      const info = await warmTurboRuntime();
      setTurboInfo(info);
      setTurboState("ready");
      notify(`ONNX Runtime is ready with ${info.provider.toUpperCase()}.`);
    } catch (error) {
      setTurboState("error");
      notify(`ONNX Runtime could not start: ${messageFromError(error)}`);
    }
  }, [notify]);

  const loadOnnxFile = useCallback(
    async (file: File | undefined) => {
      if (!file) {
        return;
      }
      setTurboState("loading");
      try {
        const info = await loadSingleOnnxStylizer(file);
        setTurboInfo(info);
        setTurboState("ready");
        notify(`Loaded ${file.name}.`);
      } catch (error) {
        setTurboState("error");
        notify(messageFromError(error));
      }
    },
    [notify],
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-paper">
      <video ref={videoRef} className="sr-only" aria-hidden playsInline muted />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full bg-ink"
        data-testid="dream-surface"
      />

      {cameraState === "idle" ? (
        <section className="absolute inset-0 grid place-items-center px-5">
          <div className="w-[min(92vw,38rem)]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-teal">
              Music in everything
            </p>
            <h1 className="max-w-[11ch] text-[4.4rem] font-black leading-[0.86] tracking-normal text-paper sm:text-[6rem]">
              Dreamcamera
            </h1>
            <p className="mt-5 max-w-[36rem] text-base leading-7 text-paper/76 sm:text-lg">
              Live camera memory: dream, charcoal, and albumen light, rendered
              locally in your browser.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 rounded-md bg-gold px-4 text-sm font-bold text-ink shadow-soft transition hover:bg-gold/90 disabled:opacity-60"
                onClick={startCamera}
                type="button"
              >
                <Camera aria-hidden className="size-5" />
                Start
              </button>
              <a
                className="inline-flex h-12 items-center gap-2 rounded-md border border-paper/16 bg-ink/60 px-4 text-sm font-semibold text-paper backdrop-blur transition hover:border-gold hover:text-gold"
                href={repoUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Github aria-hidden className="size-5" />
                Star
              </a>
              <a
                className="inline-flex h-12 items-center gap-2 rounded-md border border-paper/16 bg-ink/60 px-4 text-sm font-semibold text-paper backdrop-blur transition hover:border-coral hover:text-coral"
                href={paypalUrl}
                rel="noreferrer"
                target="_blank"
              >
                <BadgeDollarSign aria-hidden className="size-5" />
                Support
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {cameraState === "loading" ? (
        <div className="absolute inset-0 grid place-items-center bg-ink/72 backdrop-blur-sm">
          <Loader2 aria-hidden className="size-10 animate-spin text-gold" />
        </div>
      ) : null}

      <section className="absolute left-3 top-3 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
        <div className="rounded-md border border-paper/14 bg-ink/72 px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-paper shadow-soft backdrop-blur">
          Dreamcamera
        </div>
        <a
          className="grid size-10 place-items-center rounded-md border border-paper/14 bg-ink/70 text-paper shadow-soft backdrop-blur transition hover:border-gold hover:text-gold"
          href={repoUrl}
          rel="noreferrer"
          target="_blank"
          title="GitHub repository"
        >
          <Github aria-hidden className="size-5" />
        </a>
        <a
          className="grid size-10 place-items-center rounded-md border border-paper/14 bg-ink/70 text-paper shadow-soft backdrop-blur transition hover:border-coral hover:text-coral"
          href={paypalUrl}
          rel="noreferrer"
          target="_blank"
          title="PayPal support"
        >
          <BadgeDollarSign aria-hidden className="size-5" />
        </a>
      </section>

      <section className="absolute right-3 top-3 grid gap-2 sm:right-5 sm:top-5">
        <Status label="Renderer" value={rendererStatus} />
        <Status
          label="FPS"
          value={cameraState === "ready" ? String(fps) : "--"}
        />
        <Status label="ONNX" value={turboInfo?.modelName ?? turboState} />
      </section>

      <section className="absolute inset-x-3 bottom-3 rounded-lg border border-paper/12 bg-ink/72 p-2 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:w-[min(94vw,54rem)] sm:-translate-x-1/2">
        <div className="grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-2">
            {cameraState === "ready" ? (
              <IconButton label="Stop camera" onClick={stopCamera}>
                <CircleStop aria-hidden className="size-5" />
              </IconButton>
            ) : (
              <IconButton
                disabled={cameraState === "loading"}
                label="Start camera"
                onClick={startCamera}
              >
                <Camera aria-hidden className="size-5" />
              </IconButton>
            )}

            {styles.map((style) => {
              const Icon = style.icon;
              return (
                <button
                  aria-pressed={preferences.style === style.id}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-paper/14 bg-ink/68 px-3 text-sm font-semibold text-paper shadow-soft backdrop-blur transition hover:border-gold/70 hover:text-gold aria-pressed:border-teal aria-pressed:bg-teal/18"
                  key={style.id}
                  onClick={() => updatePreferences({ style: style.id })}
                  type="button"
                >
                  <Icon aria-hidden className="size-4" />
                  {style.label}
                </button>
              );
            })}
          </div>

          <label className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-3 px-1 text-xs font-medium uppercase tracking-[0.16em] text-paper/70">
            <span>Less</span>
            <input
              aria-label="Effect intensity"
              className="accent-gold"
              max="1"
              min="0"
              onChange={(event) =>
                updatePreferences({ intensity: Number(event.target.value) })
              }
              step="0.01"
              type="range"
              value={preferences.intensity}
            />
            <span>More</span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <IconButton
              active={preferences.segmentation}
              label={`MediaPipe ${segmentationState}`}
              onClick={toggleSegmentation}
            >
              <ScanFace aria-hidden className="size-5" />
            </IconButton>
            <IconButton
              active={preferences.ambience}
              label="Music in everything"
              onClick={toggleAmbience}
            >
              <Music2 aria-hidden className="size-5" />
            </IconButton>
            <IconButton
              active={turboState === "ready"}
              label={
                turboState === "ready" ? "ONNX ready" : "Warm ONNX Runtime"
              }
              onClick={warmTurbo}
            >
              {turboState === "loading" ? (
                <Loader2 aria-hidden className="size-5 animate-spin" />
              ) : (
                <Moon aria-hidden className="size-5" />
              )}
            </IconButton>
            <IconButton
              label="Load ONNX model"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload aria-hidden className="size-5" />
            </IconButton>
            <input
              ref={fileInputRef}
              accept=".onnx,.ort"
              className="sr-only"
              onChange={(event) => void loadOnnxFile(event.target.files?.[0])}
              type="file"
            />
          </div>
        </div>
      </section>

      <footer className="absolute bottom-[6.6rem] left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-paper/58 sm:bottom-5 sm:left-5 sm:right-5">
        <span>v{appVersion}</span>
        <span>commit {shortCommit(appCommit)}</span>
      </footer>
    </main>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-28 gap-0.5 rounded-md border border-paper/12 bg-ink/68 px-3 py-2 text-right shadow-soft backdrop-blur">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/48">
        {label}
      </span>
      <span className="truncate text-xs font-semibold text-paper">{value}</span>
    </div>
  );
}
