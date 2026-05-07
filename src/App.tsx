import { ErrorBoundary } from "./app/ErrorBoundary";
import { DreamCamera } from "./features/camera/DreamCamera";
import { ToastProvider } from "./components/ToastProvider";

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DreamCamera />
      </ToastProvider>
    </ErrorBoundary>
  );
}
