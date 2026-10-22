"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, Button } from "./ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Msg = {
  id: string;
  body: string;
  fromUserId: string;
  fromName: string;
  createdAt: string;
  system?: boolean;
};

export function ChatPanel({
  threadId,
  title,
  compact,
}: {
  threadId: string;
  title?: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    if (!threadId) return;
    const res = await fetch(
      `/api/messages?thread=${encodeURIComponent(threadId)}`,
    );
    const data = await res.json();
    if (res.ok) {
      setMessages(data.messages ?? []);
      setLive(true);
    }
  }, [threadId]);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 3500);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, body: text }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Gönderilemedi");
      return;
    }
    setText("");
    setMessages((prev) => [...prev, data.message]);
    inputRef.current?.focus();
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-paper shadow-[var(--shadow-xs)]",
        compact ? "h-[380px]" : "h-[min(580px,70vh)]",
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">{title ?? "Sohbet"}</p>
          <p className="text-[11px] text-muted">
            {live ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Canlı
              </span>
            ) : (
              "Bağlanıyor…"
            )}
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-wash/40 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-ink">Konuşmayı başlat</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Brief, revizyon, teslim tarihi veya kargo bilgisi için buradan yazın.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.fromUserId === user?.id && !m.system;
            if (m.system) {
              return (
                <p key={m.id} className="text-center text-[11px] text-muted">
                  {m.body}
                </p>
              );
            }
            return (
              <div
                key={m.id}
                className={cn("flex gap-2", mine ? "flex-row-reverse" : "flex-row")}
              >
                <Avatar name={m.fromName} size={28} />
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                    mine
                      ? "rounded-br-md bg-ink text-white"
                      : "rounded-bl-md bg-paper text-ink ring-1 ring-black/5",
                  )}
                >
                  {!mine ? (
                    <p className="mb-0.5 text-[11px] font-semibold text-muted">
                      {m.fromName}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] tabular",
                      mine ? "text-white/45" : "text-muted",
                    )}
                  >
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-line bg-paper p-3">
        {error ? <p className="mb-2 text-xs text-rose">{error}</p> : null}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Mesaj yaz…"
            className="max-h-28 min-h-10 flex-1 resize-none rounded-[11px] border border-line-strong bg-wash px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--accent)] focus:bg-paper focus:shadow-[0_0_0_3px_rgba(255,77,109,0.15)]"
          />
          <Button
            size="md"
            disabled={sending || !text.trim()}
            onClick={() => void send()}
            aria-label="Gönder"
          >
            <Send size={15} />
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-muted">
          Enter gönder · Shift+Enter yeni satır
        </p>
      </div>
    </div>
  );
}
