"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Thread = {
  threadId: string;
  title: string;
  subtitle: string;
  lastMessage?: string;
  lastAt: string;
  kind: "offer" | "collab";
};

function MessagesInner() {
  const params = useSearchParams();
  const initial = params.get("thread");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.threads ?? []) as Thread[];
        setThreads(list);
        if (!active && list[0]) setActive(list[0].threadId);
        if (initial) setActive(initial);
      })
      .finally(() => setLoading(false));
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = threads.find((t) => t.threadId === active);

  return (
    <div>
      <PageHeader
        kicker="İletişim"
        title="Mesajlar"
        subtitle="Teklif ve işbirliği tarafları arasında güvenli sohbet."
      />
      {loading ? (
        <div className="skeleton h-96" />
      ) : threads.length === 0 ? (
        <EmptyState
          title="Henüz sohbet yok"
          body="Teklif gönderildiğinde veya işbirliği başladığında konuşmalar burada listelenir."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-[var(--radius)] border border-line bg-paper">
            <div className="border-b border-line px-3 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">
              Konuşmalar
            </div>
            <ul className="max-h-[560px] overflow-y-auto">
              {threads.map((t) => (
                <li key={t.threadId}>
                  <button
                    type="button"
                    onClick={() => setActive(t.threadId)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-line px-3 py-3 text-left last:border-0",
                      active === t.threadId ? "bg-wash" : "hover:bg-wash/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <MessageSquare size={13} className="text-[#ff4d6d]" />
                      <span className="truncate">{t.title}</span>
                    </span>
                    <span className="truncate text-[11px] text-muted">
                      {t.lastMessage || t.subtitle}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatDateTime(t.lastAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {active ? (
            <ChatPanel
              threadId={active}
              title={current?.title ?? "Sohbet"}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96" />}>
      <MessagesInner />
    </Suspense>
  );
}
