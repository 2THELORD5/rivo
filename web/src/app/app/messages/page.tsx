"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, MessageSquare, Search } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { EmptyState, FilterChip, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Thread = {
  threadId: string;
  title: string;
  subtitle: string;
  entityHref: string;
  lastMessage?: string;
  lastAt: string;
  kind: "offer" | "collab";
  unread: number;
};

function MessagesInner() {
  const params = useSearchParams();
  const initial = params.get("thread");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(initial);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "offer" | "collab">("all");

  async function load() {
    const res = await fetch("/api/messages");
    const d = await res.json();
    const list = (d.threads ?? []) as Thread[];
    setThreads(list);
    setLoading(false);
    setActive((prev) => {
      if (initial && list.some((t) => t.threadId === initial)) return initial;
      if (prev && list.some((t) => t.threadId === prev)) return prev;
      return list[0]?.threadId ?? null;
    });
  }

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(t);
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        t.title.toLowerCase().includes(s) ||
        t.subtitle.toLowerCase().includes(s) ||
        (t.lastMessage ?? "").toLowerCase().includes(s)
      );
    });
  }, [threads, q, kind]);

  const current = threads.find((t) => t.threadId === active);

  return (
    <div>
      <PageHeader
        kicker="İletişim"
        title="Mesajlar"
        subtitle="Teklif ve işbirliği sohbetleri tek yerde — okunmamışlar vurgulanır."
      />
      {loading ? (
        <div className="skeleton h-96" />
      ) : threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Henüz sohbet yok"
          body="Teklif gönderildiğinde veya işbirliği başladığında konuşmalar burada listelenir."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="overflow-hidden rounded-[var(--radius)] border border-line bg-paper">
            <div className="space-y-2 border-b border-line p-3">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Sohbet ara…"
                  className="h-9 w-full rounded-[10px] border border-line-strong bg-wash pr-3 pl-9 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
                  Tümü
                </FilterChip>
                <FilterChip
                  active={kind === "offer"}
                  onClick={() => setKind("offer")}
                  count={threads.filter((t) => t.kind === "offer").length}
                >
                  Teklif
                </FilterChip>
                <FilterChip
                  active={kind === "collab"}
                  onClick={() => setKind("collab")}
                  count={threads.filter((t) => t.kind === "collab").length}
                >
                  İş
                </FilterChip>
              </div>
            </div>
            <ul className="max-h-[560px] overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  Sonuç yok
                </li>
              ) : (
                filtered.map((t) => (
                  <li key={t.threadId}>
                    <button
                      type="button"
                      onClick={() => setActive(t.threadId)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 border-b border-line px-3 py-3 text-left last:border-0",
                        active === t.threadId ? "bg-wash" : "hover:bg-wash/60",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
                          <MessageSquare size={13} className="shrink-0 text-[#ff4d6d]" />
                          <span className="truncate">{t.title}</span>
                        </span>
                        {t.unread > 0 ? (
                          <span className="rounded-full bg-[#ff4d6d] px-1.5 text-[10px] font-bold text-white tabular">
                            {t.unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="truncate text-[11px] text-muted">
                        {t.lastMessage || t.subtitle}
                      </span>
                      <span className="text-[10px] text-muted">
                        {formatDateTime(t.lastAt)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          {active && current ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted">{current.subtitle}</p>
                <Link
                  href={current.entityHref}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff4d6d] hover:underline"
                >
                  Kayda git <ExternalLink size={12} />
                </Link>
              </div>
              <ChatPanel threadId={active} title={current.title} />
            </div>
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
