"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastItem = { id: string; title: string; tone?: "ok" | "err" | "info" };

type ToastCtx = { push: (title: string, tone?: ToastItem["tone"]) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((title: string, tone: ToastItem["tone"] = "ok") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, title, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-[var(--shadow-md)] backdrop-blur ${
                t.tone === "err"
                  ? "border-rose-200 bg-rose-50 text-rose"
                  : t.tone === "info"
                    ? "border-violet-200 bg-violet-50 text-[#7c5cff]"
                    : "border-emerald-200 bg-white text-ink"
              }`}
            >
              {t.title}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast ToastProvider içinde");
  return ctx;
}
