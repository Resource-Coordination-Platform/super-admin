"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/format";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let notifyFn: ((toast: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  success: (title: string, message?: string) =>
    notifyFn?.({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    notifyFn?.({ type: "error", title, message }),
  info: (title: string, message?: string) =>
    notifyFn?.({ type: "info", title, message }),
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    notifyFn = ({ type, title, message }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
    return () => {
      notifyFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
          info: <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />,
        };
        const bg = {
          success: "border-emerald-200/80 bg-emerald-50/90 text-emerald-950",
          error: "border-rose-200/80 bg-rose-50/90 text-rose-950",
          info: "border-brand-200/80 bg-brand-50/90 text-brand-950",
        };

        return (
          <div
            key={t.id}
            className={cn(
              "glass-toast pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-elevated transition-all animate-scale-in",
              bg[t.type],
            )}
          >
            {icons[t.type]}
            <div className="flex-1">
              <p className="text-xs font-semibold">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs opacity-80">{t.message}</p>
              )}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
