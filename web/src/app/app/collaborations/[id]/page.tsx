"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button, Card, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { ChatPanel } from "@/components/ChatPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  draftUrl?: string | null;
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

function nextHint(status: string, role?: string) {
  if (status === "disputed") return "İtiraz açık — taraflar sohbetten çözmeli.";
  if (status === "cancelled") return "Bu iş iptal edildi.";
  if (status === "accepted" && role === "brand")
    return "Sıradaki: ödemeyi havuza yatır.";
  if (status === "funded" && role !== "brand")
    return "Sıradaki: içeriğe başla veya taslak gönder.";
  if (status === "in_progress" && role !== "brand")
    return "Sıradaki: taslak veya yayın linki gönder.";
  if (status === "content_review" && role === "brand")
    return "Sıradaki: taslağı onayla.";
  if (status === "published" && role === "brand")
    return "Sıradaki: yayını doğrula ve ödemeyi serbest bırak.";
  if (status === "paid") return "Ödeme tamamlandı.";
  return "Durumu sohbet ve işlemlerle ilerlet.";
}

export default function CollaborationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { push } = useToast();
  const [c, setC] = useState<Collab | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [urlModal, setUrlModal] = useState<null | "draft" | "publish">(null);
  const [url, setUrl] = useState("https://");
  const [disputeOpen, setDisputeOpen] = useState(false);

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
    setUrlModal(null);
    setDisputeOpen(false);
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
  const blocked = c.status === "disputed" || c.status === "cancelled";

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
          <Badge tone={blocked ? "danger" : "accent"}>
            {collabStatusLabel(c.status as never)}
          </Badge>
        }
      />

      <Card className="mb-4">
        {blocked ? (
          <p className="rounded-xl bg-rose-wash px-4 py-3 text-sm text-rose">
            {nextHint(c.status, user?.role)}
          </p>
        ) : (
          <>
            <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-1">
              <div className="absolute top-4 right-4 left-4 h-0.5 bg-line" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-[#ff4d6d] transition-all"
                style={{
                  width:
                    idx < 0
                      ? "0%"
                      : `calc(${(idx / (steps.length - 1)) * 100}% - 0px)`,
                }}
              />
              {steps.map((s, i) => {
                const done = idx > i || (idx === i && c.status === "paid");
                const current = idx === i && c.status !== "paid";
                return (
                  <div
                    key={s.key}
                    className="relative z-10 flex min-w-[72px] flex-1 flex-col items-center"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-paper ${
                        done || current
                          ? "bg-[#ff4d6d] text-white"
                          : "bg-wash-2 text-muted"
                      }`}
                    >
                      {done && !current ? <Check size={14} /> : i + 1}
                    </div>
                    <p className="mt-1.5 text-center text-[10px] font-semibold tracking-wide text-muted uppercase">
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 rounded-xl bg-wash px-4 py-3 text-sm text-slate">
              {nextHint(c.status, user?.role)}
            </p>
          </>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-xl text-ink">Ödeme özeti</h3>
          <dl className="mt-4 divide-y divide-line text-sm">
            {[
              ["Brüt tutar", formatTL(c.amount)],
              ["Hizmet bedeli (%10)", formatTL(c.commission)],
              ["Escrow", c.escrowHeld ? "Havuzda bekliyor" : "Serbest / kapalı"],
              ["Marka güven skoru", `%${c.brandScore}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
            {c.draftUrl ? (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted">Taslak</dt>
                <dd>
                  <a
                    href={c.draftUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#ff4d6d]"
                  >
                    Aç <ExternalLink size={12} />
                  </a>
                </dd>
              </div>
            ) : null}
            {c.postUrl ? (
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted">Yayın</dt>
                <dd>
                  <a
                    href={c.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-[220px] items-center gap-1 truncate font-medium text-[#ff4d6d]"
                  >
                    {c.postUrl} <ExternalLink size={12} />
                  </a>
                </dd>
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
                <Button disabled={busy} onClick={() => void act("fund")}>
                  Ödemeyi havuza yatır
                </Button>
              ) : null}
              {isInf && c.status === "funded" ? (
                <Button disabled={busy} onClick={() => void act("start_content")}>
                  İçeriğe başla
                </Button>
              ) : null}
              {isInf && (c.status === "in_progress" || c.status === "funded") ? (
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() => {
                    setUrl(c.draftUrl || "https://drive.google.com/");
                    setUrlModal("draft");
                  }}
                >
                  Taslak gönder
                </Button>
              ) : null}
              {isBrand && c.status === "content_review" ? (
                <Button disabled={busy} onClick={() => void act("approve_draft")}>
                  Taslağı onayla
                </Button>
              ) : null}
              {isInf &&
              ["in_progress", "content_review", "funded"].includes(c.status) ? (
                <Button
                  disabled={busy}
                  onClick={() => {
                    setUrl(
                      c.postUrl ||
                        `https://instagram.com/p/${c.influencerHandle}`,
                    );
                    setUrlModal("publish");
                  }}
                >
                  Yayına alındı
                </Button>
              ) : null}
              {(isBrand || user?.role === "agency") &&
              c.status === "published" &&
              !c.verifiedAt ? (
                <Button disabled={busy} onClick={() => void act("verify")}>
                  Yayını doğrula
                </Button>
              ) : null}
              {isBrand && c.status === "published" && c.verifiedAt ? (
                <Button disabled={busy} onClick={() => void act("release")}>
                  Ödemeyi serbest bırak
                </Button>
              ) : null}
              {isBrand && !["paid", "cancelled", "disputed"].includes(c.status) ? (
                <Button
                  disabled={busy}
                  variant="danger"
                  size="sm"
                  onClick={() => setDisputeOpen(true)}
                >
                  İtiraz aç
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Tutarlar lisanslı ödeme kuruluşu altyapısında tutulur. Rivo fon
              saklamaz.
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
                  <span className="absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full border-2 border-[#ff4d6d] bg-paper" />
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
        <ChatPanel threadId={`collab:${c.id}`} title="İşbirliği sohbeti" />
      </div>

      <ConfirmDialog
        open={!!urlModal}
        title={urlModal === "draft" ? "Taslak linki" : "Yayın linki"}
        body="Gerçek Drive / Instagram / TikTok bağlantısını yapıştır."
        confirmLabel="Gönder"
        busy={busy}
        onCancel={() => setUrlModal(null)}
        onConfirm={() => {
          if (!url.startsWith("http")) {
            push("Geçerli bir URL gir", "err");
            return;
          }
          if (urlModal === "draft") void act("submit_draft", { url });
          else void act("publish", { url });
        }}
      >
        <Input
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={disputeOpen}
        title="İtiraz açılsın mı?"
        body="Ödeme serbest bırakma durur. Brief uyumsuzluğu gerekçesiyle kayda geçer."
        confirmLabel="İtiraz aç"
        danger
        busy={busy}
        onCancel={() => setDisputeOpen(false)}
        onConfirm={() => void act("dispute", { reason: "Brief uyumsuzluğu" })}
      />
    </div>
  );
}
