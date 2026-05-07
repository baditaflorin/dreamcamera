import type { FrameMood } from "../camera/cameraAnalysis";

export class DreamAudioEngine {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];

  async start(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.0001;
      this.filter = this.context.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 980;

      const frequencies = [110, 164.81, 246.94];
      this.oscillators = frequencies.map((frequency, index) => {
        const oscillator = this.context!.createOscillator();
        oscillator.type = index === 1 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        oscillator.connect(this.filter!);
        oscillator.start();
        return oscillator;
      });

      this.filter.connect(this.gain);
      this.gain.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.gain?.gain.setTargetAtTime(0.035, this.context.currentTime, 0.9);
  }

  stop(): void {
    if (!this.context || !this.gain) {
      return;
    }
    this.gain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.25);
  }

  update(mood: FrameMood): void {
    if (!this.context || !this.gain || !this.filter) {
      return;
    }

    const base =
      mood.style === "charcoal" ? 82.41 : mood.style === "albumen" ? 98 : 110;
    const shimmer = mood.luminance * 26 + mood.motion * 18;
    const chord =
      mood.style === "albumen"
        ? [1, 1.25, 1.5]
        : mood.style === "charcoal"
          ? [1, 1.2, 1.414]
          : [1, 1.5, 2];

    this.oscillators.forEach((oscillator, index) => {
      oscillator.frequency.setTargetAtTime(
        base * chord[index] + shimmer,
        this.context!.currentTime,
        0.32,
      );
    });

    this.filter.frequency.setTargetAtTime(
      520 + mood.luminance * 940 + mood.intensity * 420,
      this.context.currentTime,
      0.4,
    );
    this.gain.gain.setTargetAtTime(
      0.02 + mood.motion * 0.03,
      this.context.currentTime,
      0.5,
    );
  }

  async dispose(): Promise<void> {
    if (!this.context) {
      return;
    }
    await this.context.close();
    this.context = null;
    this.gain = null;
    this.filter = null;
    this.oscillators = [];
  }
}
