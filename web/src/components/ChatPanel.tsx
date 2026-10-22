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
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!threadId) return;
    const res = await fetch(
      `/api/messages?thread=${encodeURIComponent(threadId)}`,
    );
    const data = await res.json();
    if (res.ok) setMessages(data.messages ?? []);
  }, [threadId]);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 4000);
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
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-paper",
        compact ? "h-[360px]" : "h-[min(560px,70vh)]",
      )}
    >
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-semibold text-ink">{title ?? "Sohbet"}</p>
        <p className="text-[11px] text-muted">
          Karşı taraf gerçek zamanlı görür · 4 sn yenileme
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Henüz mesaj yok. Brief, revizyon veya teslim için yazın.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.fromUserId === user?.id && !m.system;
            if (m.system) {
              return (
                <p
                  key={m.id}
                  className="text-center text-[11px] text-muted"
                >
                  {m.body}
                </p>
              );
            }
            return (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2",
                  mine ? "flex-row-reverse" : "flex-row",
                )}
              >
                <Avatar name={m.fromName} size={28} />
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "bg-ink text-white"
                      : "bg-wash text-ink ring-1 ring-black/5",
                  )}
                >
                  {!mine ? (
                    <p className="mb-0.5 text-[11px] font-semibold opacity-70">
                      {m.fromName}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/50" : "text-muted",
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
      <div className="border-t border-line p-3">
        {error ? <p className="mb-2 text-xs text-rose">{error}</p> : null}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Mesaj yaz…"
            className="h-10 flex-1 rounded-xl border border-line-strong bg-wash px-3 text-sm outline-none focus:border-[#ff4d6d]"
          />
          <Button size="sm" disabled={sending || !text.trim()} onClick={() => void send()}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
