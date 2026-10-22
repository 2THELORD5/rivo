"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { ChatPanel } from "@/components/ChatPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { formatDate, formatTL, offerStatusLabel } from "@/lib/format";

type Offer = {
  id: string;
  title: string;
  budget: number;
  counterBudget?: number | null;
  counterNote?: string | null;
  status: string;
  brandName: string;
  influencerName: string;
  influencerHandle: string;
  contentType: string;
  dueDate: string;
  usageRightsDays: number;
  revisions: number;
  brief: string;
  brandNote?: string | null;
  createdAt: string;
  collaborationId?: string | null;
};

const tone: Record<string, "warn" | "blue" | "accent" | "danger" | "neutral"> = {
  pending: "warn",
  countered: "blue",
  accepted: "accent",
  rejected: "danger",
  cancelled: "neutral",
};

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [o, setO] = useState<Offer | null>(null);
  const [counterBudget, setCounterBudget] = useState(0);
  const [counterNote, setCounterNote] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [confirm, setConfirm] = useState<null | "reject" | "cancel">(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/offers/${id}`);
    const data = await res.json();
    if (res.ok) {
      setO(data.offer);
      setCounterBudget(
        Math.round((data.offer.budget as number) * 1.15),
      );
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function respond(
    action: "accept" | "reject" | "counter" | "accept_counter",
  ) {
    setBusy(true);
    const res = await fetch(`/api/offers/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        counterBudget: action === "counter" ? counterBudget : undefined,
        counterNote: action === "counter" ? counterNote : undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    setConfirm(null);
    if (!res.ok) {
      push(data.error || "İşlem başarısız", "err");
      return;
    }
    if (action === "accept" || action === "accept_counter") {
      push("Teklif kabul edildi");
      const cid = data.collaboration?.id;
      if (cid) router.push(`/app/collaborations/${cid}`);
      else await load();
      return;
    }
    push(action === "reject" ? "Teklif reddedildi" : "Karşı teklif gönderildi");
    setShowCounter(false);
    await load();
  }

  async function cancel() {
    setBusy(true);
    const res = await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setBusy(false);
    setConfirm(null);
    if (!res.ok) {
      const data = await res.json();
      push(data.error || "İptal edilemedi", "err");
      return;
    }
    push("Teklif iptal edildi", "info");
    await load();
  }

  if (!o) return <div className="skeleton h-96 w-full" />;

  const isBrand = user?.role === "brand";
  const isInf = user?.role === "influencer" || user?.role === "agency";

  return (
    <div>
      <Link
        href="/app/offers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Teklifler
      </Link>
      <PageHeader
        kicker="Teklif detayı"
        title={o.title}
        subtitle={`${o.brandName} → @${o.influencerHandle}`}
        action={
          <Badge tone={tone[o.status] ?? "neutral"}>
            {offerStatusLabel(o.status as never)}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar
                name={isBrand ? o.influencerName : o.brandName}
                size={48}
              />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {isBrand ? o.influencerName : o.brandName}
                </p>
                <p className="text-xs text-muted">
                  @{o.influencerHandle} · {formatDate(o.createdAt)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate">{o.brief}</p>
            {o.brandNote ? (
              <p className="mt-3 rounded-xl bg-wash px-3 py-2 text-xs text-muted">
                Marka notu: {o.brandNote}
              </p>
            ) : null}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink">Şartlar</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Bütçe", formatTL(o.budget)],
                ["İçerik", o.contentType],
                ["Teslim", formatDate(o.dueDate)],
                ["Kullanım hakkı", `${o.usageRightsDays} gün`],
                ["Revizyon", String(o.revisions)],
                [
                  "Karşı teklif",
                  o.counterBudget ? formatTL(o.counterBudget) : "—",
                ],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-wash px-3 py-2.5">
                  <dt className="text-[11px] text-muted">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {o.counterNote ? (
              <p className="mt-3 text-xs text-muted">{o.counterNote}</p>
            ) : null}
          </Card>

          <div className="flex flex-wrap gap-2">
            {isInf && o.status === "pending" ? (
              <>
                <Button disabled={busy} onClick={() => void respond("accept")}>
                  Kabul et
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setShowCounter((v) => !v)}
                >
                  Karşı teklif
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setConfirm("reject")}
                >
                  Reddet
                </Button>
              </>
            ) : null}
            {isBrand && o.status === "countered" ? (
              <Button
                disabled={busy}
                onClick={() => void respond("accept_counter")}
              >
                Karşı teklifi kabul et
              </Button>
            ) : null}
            {isBrand && ["pending", "countered"].includes(o.status) ? (
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => setConfirm("cancel")}
              >
                İptal et
              </Button>
            ) : null}
            {o.status === "accepted" && o.collaborationId ? (
              <ButtonLink href={`/app/collaborations/${o.collaborationId}`}>
                İşbirliğine git <ArrowUpRight size={15} />
              </ButtonLink>
            ) : null}
            <ButtonLink
              href={`/app/messages?thread=${encodeURIComponent(`offer:${o.id}`)}`}
              variant="outline"
            >
              <MessageSquare size={14} /> Mesajlarda aç
            </ButtonLink>
          </div>

          {showCounter ? (
            <Card className="space-y-3">
              <Input
                label="Karşı bütçe (TL)"
                type="number"
                value={counterBudget}
                onChange={(e) => setCounterBudget(Number(e.target.value))}
              />
              <Textarea
                label="Açıklama"
                rows={2}
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
              />
              <Button
                size="sm"
                disabled={busy}
                onClick={() => void respond("counter")}
              >
                Karşı teklifi gönder
              </Button>
            </Card>
          ) : null}
        </div>

        <ChatPanel threadId={`offer:${o.id}`} title="Teklif sohbeti" />
      </div>

      <ConfirmDialog
        open={confirm === "reject"}
        title="Teklifi reddet?"
        body="Bu işlem geri alınamaz. Markaya bildirim düşer."
        confirmLabel="Reddet"
        danger
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void respond("reject")}
      />
      <ConfirmDialog
        open={confirm === "cancel"}
        title="Teklifi iptal et?"
        body="Bekleyen teklif kapatılır. Harcanan jeton iade edilmez (demo)."
        confirmLabel="İptal et"
        danger
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void cancel()}
      />
    </div>
  );
}
