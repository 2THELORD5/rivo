"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { formatNumber, formatTL } from "@/lib/format";

export default function InfluencerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [inf, setInf] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    budget: 15000,
    contentType: "1 Reels + 3 Story",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    usageRightsDays: 90,
    revisions: 2,
    brief: "",
  });

  useEffect(() => {
    fetch(`/api/influencers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setInf(d.influencer);
        if (d.influencer) {
          setForm((f) => ({
            ...f,
            title: `${d.influencer.niche} işbirliği — @${d.influencer.handle}`,
            budget: d.influencer.minBudget,
            brief: `Kampanya amacı, ürün kullanım senaryosu ve zorunlu mesajlar bu alanda netleştirilir. #işbirliği etiketi zorunludur. Marka ürününü kargo ile gönderir.`,
          }));
        }
      });
  }, [id]);

  async function sendOffer() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: id, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      push(data.error || "Teklif gönderilemedi", "err");
      return;
    }
    push("Teklif gönderildi · 150 jeton düşüldü");
    router.push("/app/offers");
  }

  if (!inf) {
    return <div className="skeleton h-64 w-full" />;
  }

  const platforms = inf.platforms as Array<{
    name: string;
    followers: number;
    engagement: number;
    verified: boolean;
  }>;

  return (
    <div>
      <Link
        href="/app/discover"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Havuz
      </Link>
      <PageHeader
        kicker="Profil"
        title={String(inf.name)}
        subtitle={`@${inf.handle} · ${inf.city} · aylık erişim ${formatNumber(Number(inf.monthlyReach))}`}
        action={<Badge tone="accent">{String(inf.niche)}</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name={String(inf.name)} size={56} />
              <div>
                <p className="text-sm font-semibold text-ink">{String(inf.name)}</p>
                <p className="text-xs text-muted">
                  Min. {formatTL(Number(inf.minBudget))} · güven skoru %
                  {String(inf.reliabilityScore)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate">{String(inf.bio)}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(inf.tags as string[]).map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-wash px-2 py-1 text-[11px] font-medium text-slate"
                >
                  #{t}
                </span>
              ))}
            </div>
          </Card>

          <Card padding="none">
            <div className="border-b border-line px-5 py-3">
              <h3 className="text-sm font-semibold text-ink">Bağlı hesaplar</h3>
            </div>
            <ul>
              {platforms.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between border-b border-line px-5 py-3.5 last:border-0"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                    {p.name}
                    {p.verified ? (
                      <BadgeCheck size={15} className="text-accent" />
                    ) : (
                      <Badge tone="warn">Manuel</Badge>
                    )}
                  </span>
                  <span className="text-sm text-muted">
                    {formatNumber(p.followers)} · %{p.engagement} ER
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <h3 className="font-display text-xl text-ink">Teklif oluştur</h3>
          <p className="mt-1 text-xs text-muted">
            Her gönderim 150 jeton düşer. Üreticinin minimum bütçesinin altında
            teklif iletilemez.
          </p>
          <div className="mt-4 space-y-3">
            <Input
              label="Başlık"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Bütçe (TL)"
                type="number"
                value={form.budget}
                onChange={(e) =>
                  setForm({ ...form, budget: Number(e.target.value) })
                }
              />
              <Input
                label="Teslim tarihi"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <Input
              label="İçerik türü"
              value={form.contentType}
              onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Kullanım hakkı (gün)"
                type="number"
                value={form.usageRightsDays}
                onChange={(e) =>
                  setForm({ ...form, usageRightsDays: Number(e.target.value) })
                }
              />
              <Input
                label="Revizyon hakkı"
                type="number"
                value={form.revisions}
                onChange={(e) =>
                  setForm({ ...form, revisions: Number(e.target.value) })
                }
              />
            </div>
            <Textarea
              label="Brief"
              rows={5}
              value={form.brief}
              onChange={(e) => setForm({ ...form, brief: e.target.value })}
            />
          </div>
          {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
          <Button className="mt-4 w-full" disabled={loading} onClick={sendOffer}>
            {loading ? "Gönderiliyor…" : "Teklifi gönder"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
