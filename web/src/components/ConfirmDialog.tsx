"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  danger,
  busy,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Kapat"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="relative w-full max-w-md rounded-2xl border border-line bg-paper p-5 shadow-[var(--shadow-md)]"
          >
            <h3 className="font-display text-xl text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            {children ? <div className="mt-4">{children}</div> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                size="sm"
                disabled={busy}
                onClick={onConfirm}
              >
                {busy ? "…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
