import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type Toast = {
  id: number;
  message: string;
};

type ToastContextValue = {
  notify: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message }].slice(-3));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5600);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 grid max-w-[min(92vw,24rem)] gap-2"
      >
        {toasts.map((toast) => (
          <div
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-paper/14 bg-ink/92 p-3 text-sm text-paper shadow-2xl backdrop-blur"
            key={toast.id}
          >
            <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
            <button
              aria-label="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-md text-paper/70 hover:bg-paper/10 hover:text-paper"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
              type="button"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
