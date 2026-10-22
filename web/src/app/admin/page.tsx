"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Handshake,
  LogOut,
  MessageSquare,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import { formatDateTime, formatTL } from "@/lib/format";

type Tab = "overview" | "users" | "offers" | "collabs" | "messages" | "logs";

type Snapshot = {
  counts: Record<string, number>;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    disabled: boolean;
    tokens: number | null;
    subscriptionTier: string | null;
    createdAt: string;
  }>;
  offers: Array<{
    id: string;
    title: string;
    status: string;
    budget: number;
    brandName: string;
    influencerHandle: string;
  }>;
  collaborations: Array<{
    id: string;
    title: string;
    status: string;
    amount: number;
    escrowHeld: boolean;
    brandName: string;
    influencerHandle: string;
  }>;
  messages: Array<{
    id: string;
    body: string;
    fromName: string;
    threadId: string;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    at: string;
    actor: string;
    actorType: string;
    action: string;
    entity: string;
    entityId?: string;
    detail?: string;
  }>;
};

export default function AdminPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const me = await fetch("/api/admin/me");
    if (!me.ok) {
      router.replace("/login?admin=1");
      return;
    }
    setOk(true);
    const res = await fetch("/api/admin/data");
    if (res.ok) setData(await res.json());
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) setData(await res.json());
  }

  if (!ok || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Logo invert />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Özet" },
    { id: "users", label: "Kullanıcılar" },
    { id: "offers", label: "Teklifler" },
    { id: "collabs", label: "İşbirlikleri" },
    { id: "messages", label: "Mesajlar" },
    { id: "logs", label: "Loglar" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo invert />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white/70 uppercase">
            Admin
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            disabled={busy}
            onClick={() => void load()}
          >
            <RefreshCw size={14} /> Yenile
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => {
              if (confirm("Veritabanı seed’e sıfırlansın mı?")) {
                void act({ action: "reset" });
              }
            }}
          >
            DB sıfırla
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            <LogOut size={14} /> Çıkış
          </Button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-white text-ink"
                : "bg-white/5 text-white/65 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Kullanıcı", data.counts.users, Users],
              ["Teklif", data.counts.offers, Handshake],
              ["İşbirliği", data.counts.collaborations, Wallet],
              ["Log", data.counts.auditLogs, Activity],
            ] as [string, number, LucideIcon][]
          ).map(([label, n, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  {label}
                </p>
                <Icon size={16} className="text-[#ff4d6d]" />
              </div>
              <p className="mt-3 font-display text-3xl">{n}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Mesaj / Audit
            </p>
            <p className="mt-2 text-sm text-white/70">
              {data.counts.messages} mesaj · {data.counts.auditLogs} log kaydı
            </p>
          </div>
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/45">
              <tr>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Jeton</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-white/45">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{u.role}</td>
                  <td className="px-4 py-3 tabular">
                    <input
                      type="number"
                      defaultValue={u.tokens ?? 0}
                      className="w-20 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-sm"
                      onBlur={(e) =>
                        void act({
                          action: "user.update",
                          userId: u.id,
                          patch: { tokens: Number(e.target.value) },
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    {u.disabled ? (
                      <span className="text-[#ff4d6d]">Askıda</span>
                    ) : (
                      <span className="text-emerald-400">Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 bg-transparent text-white"
                      onClick={() =>
                        void act({
                          action: "user.update",
                          userId: u.id,
                          patch: { disabled: !u.disabled },
                        })
                      }
                    >
                      {u.disabled ? "Aç" : "Askıya al"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "offers" ? (
        <div className="space-y-2">
          {data.offers.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium">{o.title}</p>
                <p className="text-xs text-white/45">
                  {o.brandName} → @{o.influencerHandle} · {formatTL(o.budget)}
                </p>
              </div>
              <select
                value={o.status}
                className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm"
                onChange={(e) =>
                  void act({
                    action: "offer.update",
                    offerId: o.id,
                    patch: { status: e.target.value },
                  })
                }
              >
                {["pending", "countered", "accepted", "rejected", "cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "collabs" ? (
        <div className="space-y-2">
          {data.collaborations.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-white/45">
                  {c.brandName} · @{c.influencerHandle} · {formatTL(c.amount)}
                  {c.escrowHeld ? " · havuzda" : ""}
                </p>
              </div>
              <select
                value={c.status}
                className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm"
                onChange={(e) =>
                  void act({
                    action: "collab.update",
                    collabId: c.id,
                    patch: { status: e.target.value },
                  })
                }
              >
                {[
                  "accepted",
                  "funded",
                  "in_progress",
                  "content_review",
                  "published",
                  "disputed",
                  "paid",
                  "cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "messages" ? (
        <div className="space-y-2">
          {data.messages.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-xs text-white/45">
                  {m.fromName} · {m.threadId} · {formatDateTime(m.createdAt)}
                </p>
                <p className="mt-1 text-sm text-white/85">{m.body}</p>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  void act({ action: "message.delete", messageId: m.id })
                }
              >
                Sil
              </Button>
            </div>
          ))}
          {data.messages.length === 0 ? (
            <p className="text-sm text-white/45">Mesaj yok.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "logs" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="max-h-[70vh] overflow-y-auto">
            {data.auditLogs.map((l) => (
              <div
                key={l.id}
                className="border-b border-white/10 px-4 py-3 last:border-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{l.action}</p>
                  <p className="text-[11px] text-white/40">
                    {formatDateTime(l.at)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-white/55">
                  {l.actorType}:{l.actor} · {l.entity}
                  {l.entityId ? `/${l.entityId.slice(0, 8)}` : ""}
                  {l.detail ? ` · ${l.detail}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-8 flex items-center gap-2 text-xs text-white/35">
        <MessageSquare size={12} /> Tüm kritik işlemler audit log’a yazılır.
      </p>
    </div>
  );
}
