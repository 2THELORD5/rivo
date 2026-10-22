"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import {
  formatDate,
  formatNumber,
  formatTL,
  jobAppStatusLabel,
  jobStatusLabel,
} from "@/lib/format";

type Job = {
  id: string;
  title: string;
  niche: string;
  description: string;
  contentType: string;
  budgetMin: number;
  budgetMax: number;
  dueDate: string;
  usageRightsDays: number;
  revisions: number;
  platforms: string[];
  status: "open" | "closed" | "filled";
  brandName: string;
  brandIndustry: string;
  applicationCount: number;
  pendingCount: number;
  createdAt: string;
};

type AppRow = {
  id: string;
  proposedBudget: number;
  pitch: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  influencerName: string;
  influencerHandle: string;
  niche: string;
  reliabilityScore: number;
  monthlyReach: number;
  offerId?: string | null;
  createdAt: string;
};

const jobTone = {
  open: "accent" as const,
  closed: "neutral" as const,
  filled: "blue" as const,
};

const appTone = {
  pending: "warn" as const,
  accepted: "accent" as const,
  rejected: "danger" as const,
  withdrawn: "neutral" as const,
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [budget, setBudget] = useState(0);
  const [pitch, setPitch] = useState("");

  const isBrand = user?.role === "brand";
  const isInf = user?.role === "influencer";

  const load = useCallback(async () => {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    if (!res.ok) {
      push(data.error || "İlan bulunamadı", "err");
      return;
    }
    setJob(data.job);
    setApps(data.applications ?? []);
    if (data.job) {
      setBudget(
        Math.round((data.job.budgetMin + data.job.budgetMax) / 2),
      );
    }
  }, [id, push]);

  useEffect(() => {
    void load();
  }, [load]);

  async function apply() {
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposedBudget: budget, pitch }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      push(data.error || "Teklif gönderilemedi", "err");
      return;
    }
    push("Teklifin iletildi");
    setPitch("");
    await load();
  }

  async function respond(appId: string, action: "accept" | "reject") {
    setBusy(true);
    const res = await fetch(`/api/jobs/applications/${appId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      push(data.error || "İşlem başarısız", "err");
      return;
    }
    if (action === "accept" && data.collaboration?.id) {
      push("Teklif kabul · işbirliği oluştu");
      router.push(`/app/collaborations/${data.collaboration.id}`);
      return;
    }
    push(action === "accept" ? "Kabul edildi" : "Reddedildi");
    await load();
  }

  async function setStatus(status: "open" | "closed") {
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      push(data.error || "Güncellenemedi", "err");
      return;
    }
    push(status === "closed" ? "İlan kapatıldı" : "İlan yeniden açıldı");
    setJob(data.job);
  }

  if (!job) return <div className="skeleton h-96 w-full" />;

  const myPending = apps.some((a) => a.status === "pending");

  return (
    <div>
      <Link
        href="/app/jobs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> İlanlar
      </Link>
      <PageHeader
        kicker="İlan detayı"
        title={job.title}
        subtitle={`${job.brandName}${job.niche ? ` · ${job.niche}` : ""}`}
        action={
          <Badge tone={jobTone[job.status]}>{jobStatusLabel(job.status)}</Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name={job.brandName} size={48} />
              <div>
                <p className="text-sm font-semibold text-ink">{job.brandName}</p>
                <p className="text-xs text-muted">
                  {job.brandIndustry || "Marka"} · {formatDate(job.createdAt)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              {job.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.platforms.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-wash px-2 py-1 text-[11px] font-medium text-slate"
                >
                  {p}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink">Şartlar</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                [
                  "Bütçe bandı",
                  `${formatTL(job.budgetMin)} – ${formatTL(job.budgetMax)}`,
                ],
                ["İçerik", job.contentType],
                ["Teslim", formatDate(job.dueDate)],
                ["Kullanım hakkı", `${job.usageRightsDays} gün`],
                ["Revizyon", String(job.revisions)],
                ["Teklif sayısı", String(job.applicationCount)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-wash px-3 py-2.5">
                  <dt className="text-[11px] text-muted">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {isBrand ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  Gelen teklifler
                </h3>
                {job.status === "open" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void setStatus("closed")}
                  >
                    İlanı kapat
                  </Button>
                ) : job.status === "closed" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void setStatus("open")}
                  >
                    Yeniden aç
                  </Button>
                ) : null}
              </div>
              {apps.length === 0 ? (
                <p className="text-sm text-muted">
                  Henüz teklif yok. İlan açık kaldıkça üreticiler başvurabilir.
                </p>
              ) : (
                <ul className="space-y-3">
                  {apps.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-xl border border-line px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <Avatar name={a.influencerName} size={36} />
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {a.influencerName}
                            </p>
                            <p className="text-xs text-muted">
                              @{a.influencerHandle} · {a.niche} · erişim{" "}
                              {formatNumber(a.monthlyReach)} · güven %
                              {a.reliabilityScore}
                            </p>
                          </div>
                        </div>
                        <Badge tone={appTone[a.status]}>
                          {jobAppStatusLabel(a.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate">{a.pitch}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-ink tabular">
                          {formatTL(a.proposedBudget)}
                        </span>
                        {a.status === "pending" && job.status === "open" ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={busy}
                              onClick={() => void respond(a.id, "reject")}
                            >
                              Reddet
                            </Button>
                            <Button
                              type="button"
                              disabled={busy}
                              onClick={() => void respond(a.id, "accept")}
                            >
                              Kabul et
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          {isInf && job.status === "open" ? (
            <Card>
              <h3 className="text-sm font-semibold text-ink">Teklif ver</h3>
              <p className="mt-1 text-xs text-muted">
                Band: {formatTL(job.budgetMin)} – {formatTL(job.budgetMax)}
              </p>
              {myPending ? (
                <p className="mt-4 text-sm text-slate">
                  Bu ilana bekleyen teklifin var. Marka yanıtlayınca bildirim
                  alırsın.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  <Input
                    label="Önerilen bütçe (TL)"
                    type="number"
                    min={job.budgetMin}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                  <Textarea
                    label="Pitch"
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Neden sen? Benzer işler, erişim, teslim süresi…"
                  />
                  <Button
                    type="button"
                    className="w-full"
                    disabled={busy || !pitch.trim()}
                    onClick={() => void apply()}
                  >
                    {busy ? "Gönderiliyor…" : "Teklif gönder"}
                  </Button>
                </div>
              )}
              {apps.length > 0 ? (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="mb-2 text-xs font-medium text-muted">
                    Senin tekliflerin
                  </p>
                  <ul className="space-y-2">
                    {apps.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="font-semibold tabular">
                          {formatTL(a.proposedBudget)}
                        </span>
                        <Badge tone={appTone[a.status]}>
                          {jobAppStatusLabel(a.status)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          ) : null}

          {!isBrand && !isInf ? (
            <Card>
              <p className="text-sm text-muted">
                İş ilanlarına teklif vermek için üretici hesabı gerekir.
              </p>
            </Card>
          ) : null}

          {isBrand ? (
            <Card>
              <h3 className="text-sm font-semibold text-ink">İpucu</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Bir teklifi kabul ettiğinde 150 jeton düşülür, otomatik teklif +
                işbirliği oluşur; diğer bekleyen başvurular reddedilir.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
