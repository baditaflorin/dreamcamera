import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { repoUrl } from "../features/version/buildInfo";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-dvh place-items-center bg-ink text-paper">
        <section className="w-[min(92vw,34rem)] rounded-lg border border-paper/15 bg-ink/80 p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle aria-hidden className="size-6 text-coral" />
            <h1 className="text-xl font-semibold">Dreamcamera stopped</h1>
          </div>
          <p className="text-sm leading-6 text-paper/72">
            {this.state.error.message}
          </p>
          <a
            className="mt-5 inline-flex text-sm font-medium text-gold underline-offset-4 hover:underline"
            href={repoUrl}
          >
            Open GitHub
          </a>
        </section>
      </main>
    );
  }
}
