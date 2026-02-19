import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type NotificationType = "success" | "error";

interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

interface NotificationContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hide: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const AUTO_HIDE_MS = 4000;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<NotificationState>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    setState({ message, type: "success", isVisible: true });
  }, []);

  const showError = useCallback((message: string) => {
    setState({ message, type: "error", isVisible: true });
  }, []);

  useEffect(() => {
    if (!state.isVisible) return;
    const timer = setTimeout(hide, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [state.isVisible, hide]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, hide }}>
      {children}
      {state.isVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 py-3 shadow-md"
          role="alert"
        >
          <div
            className={`flex items-center justify-between gap-4 max-w-lg w-full px-4 py-3 rounded-lg text-white ${
              state.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            <span className="font-medium">{state.message}</span>
            <button
              type="button"
              onClick={hide}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              aria-label="Закрыть"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
