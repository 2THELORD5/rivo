"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { ChatPanel } from "@/components/ChatPanel";
import { collabStatusLabel, formatDateTime, formatTL } from "@/lib/format";

type Collab = {
  id: string;
  title: string;
  status: string;
  amount: number;
  commission: number;
  escrowHeld: boolean;
  brandName: string;
  influencerName: string;
  influencerHandle: string;
  agencyName?: string | null;
  brandScore: number;
  postUrl?: string | null;
  verifiedAt?: string | null;
  timeline: { at: string; label: string; by: string }[];
};

const steps = [
  { key: "accepted", label: "Sözleşme" },
  { key: "funded", label: "Havuz" },
  { key: "in_progress", label: "İçerik" },
  { key: "content_review", label: "Onay" },
  { key: "published", label: "Yayın" },
  { key: "paid", label: "Ödeme" },
];

function stepIndex(status: string) {
  if (status === "disputed" || status === "cancelled") return -1;
  if (status === "paid") return 5;
  if (status === "published") return 4;
  if (status === "content_review") return 3;
  if (status === "in_progress") return 2;
  if (status === "funded") return 1;
  return 0;
}

export default function CollaborationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { push } = useToast();
  const [c, setC] = useState<Collab | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/collaborations/${id}`);
    const data = await res.json();
    setC(data.collaboration);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: string, extra?: Record<string, string>) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/collaborations/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, by: user?.name, ...extra }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error);
      push(data.error || "İşlem başarısız", "err");
      return;
    }
    setC(data.collaboration);
    const labels: Record<string, string> = {
      fund: "Ödeme havuza alındı",
      start_content: "İçerik üretimi başladı",
      submit_draft: "Taslak gönderildi",
      approve_draft: "Taslak onaylandı",
      publish: "Yayın kaydedildi",
      verify: "Yayın doğrulandı",
      release: "Ödeme serbest bırakıldı",
      dispute: "İtiraz açıldı",
    };
    push(labels[action] ?? "Güncellendi");
  }

  if (!c) return <div className="skeleton h-80 w-full" />;

  const idx = stepIndex(c.status);
  const isBrand = user?.role === "brand";
  const isInf = user?.role === "influencer" || user?.role === "agency";

  return (
    <div>
      <Link
        href="/app/collaborations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> İşler
      </Link>
      <PageHeader
        kicker="İşbirliği"
        title={c.title}
        subtitle={`${c.brandName} · @${c.influencerHandle}${c.agencyName ? ` · ${c.agencyName}` : ""}`}
        action={
          <Badge tone="accent">{collabStatusLabel(c.status as never)}</Badge>
        }
      />

      <Card className="mb-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {steps.map((s, i) => {
            const done = idx > i || (idx === i && c.status === "paid");
            const current = idx === i && c.status !== "paid";
            return (
              <div key={s.key} className="flex min-w-[70px] flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    done || current
                      ? "bg-accent text-white"
                      : "bg-wash-2 text-muted"
                  }`}
                >
                  {done && !current ? <Check size={14} /> : i + 1}
                </div>
                <p className="mt-1.5 text-center text-[10px] font-semibold tracking-wide text-muted uppercase">
                  {s.label}
                </p>
                {i < steps.length - 1 ? (
                  <span className="sr-only">sonraki</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-xl text-ink">Ödeme özeti</h3>
          <dl className="mt-4 divide-y divide-line text-sm">
            {[
              ["Brüt tutar", formatTL(c.amount)],
              ["Hizmet bedeli (%10)", formatTL(c.commission)],
              ["Escrow durumu", c.escrowHeld ? "Havuzda bekliyor" : "Serbest / kapalı"],
              ["Marka güven skoru", `%${c.brandScore}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
            {c.postUrl ? (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted">Yayın bağlantısı</dt>
                <dd className="truncate font-medium text-accent">{c.postUrl}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              İşlemler
            </p>
            {error ? <p className="mt-2 text-sm text-rose">{error}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {isBrand && c.status === "accepted" ? (
                <Button disabled={busy} onClick={() => act("fund")}>
                  Ödemeyi havuza yatır
                </Button>
              ) : null}
              {isInf && c.status === "funded" ? (
                <Button disabled={busy} onClick={() => act("start_content")}>
                  İçeriğe başla
                </Button>
              ) : null}
              {isInf && (c.status === "in_progress" || c.status === "funded") ? (
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() =>
                    act("submit_draft", { url: "https://drive.google.com/file/d/taslak" })
                  }
                >
                  Taslak gönder
                </Button>
              ) : null}
              {isBrand && c.status === "content_review" ? (
                <Button disabled={busy} onClick={() => act("approve_draft")}>
                  Taslağı onayla
                </Button>
              ) : null}
              {isInf &&
              ["in_progress", "content_review", "funded"].includes(c.status) ? (
                <Button
                  disabled={busy}
                  onClick={() =>
                    act("publish", {
                      url: `https://instagram.com/p/${c.influencerHandle}`,
                    })
                  }
                >
                  Yayına alındı
                </Button>
              ) : null}
              {(isBrand || user?.role === "agency") &&
              c.status === "published" &&
              !c.verifiedAt ? (
                <Button disabled={busy} onClick={() => act("verify")}>
                  Yayını doğrula
                </Button>
              ) : null}
              {isBrand && c.status === "published" && c.verifiedAt ? (
                <Button disabled={busy} onClick={() => act("release")}>
                  Ödemeyi serbest bırak
                </Button>
              ) : null}
              {isBrand && !["paid", "cancelled", "disputed"].includes(c.status) ? (
                <Button
                  disabled={busy}
                  variant="danger"
                  size="sm"
                  onClick={() => act("dispute", { reason: "Brief uyumsuzluğu" })}
                >
                  İtiraz aç
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Tutarlar lisanslı ödeme kuruluşu altyapısında tutulur. Rivo fon
              saklamaz; serbest bırakma kuralı sözleşmeye bağlıdır.
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-xl text-ink">Zaman çizelgesi</h3>
          <div className="relative mt-5">
            <div className="absolute top-1 bottom-1 left-[5px] w-px bg-line" />
            <AnimatePresence initial={false}>
              {[...c.timeline].reverse().map((t, i) => (
                <motion.div
                  key={`${t.at}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mb-4 pl-6"
                >
                  <span className="absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full border-2 border-accent bg-paper" />
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="text-[12px] text-muted">
                    {t.by} · {formatDateTime(t.at)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <ChatPanel
          threadId={`collab:${c.id}`}
          title="İşbirliği sohbeti"
        />
      </div>
    </div>
  );
}
