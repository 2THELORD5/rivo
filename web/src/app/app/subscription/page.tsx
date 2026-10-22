"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { tierLabel } from "@/lib/format";
import type { SubscriptionTier } from "@/lib/types";

const plans: {
  tier: SubscriptionTier;
  name: string;
  price: string;
  tokens: number;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    tier: "starter",
    name: "Başlangıç",
    price: "2.999",
    tokens: 20,
    features: [
      "Doğrulanmış havuza erişim",
      "20 teklif jetonu / ay",
      "Temel kampanya takibi",
    ],
  },
  {
    tier: "growth",
    name: "Büyüme",
    price: "9.999",
    tokens: 60,
    highlighted: true,
    features: [
      "Öncelikli eşleşme desteği",
      "60 teklif jetonu / ay",
      "Ajanslı üretici erişimi",
      "Marka güven skoru görünümü",
    ],
  },
  {
    tier: "enterprise",
    name: "Kurumsal",
    price: "29.999",
    tokens: 200,
    features: [
      "Sınırsız ekip üyesi",
      "200 teklif jetonu / ay",
      "Özel başarı yöneticisi",
      "Toplu faturalama",
    ],
  },
];

export default function SubscriptionPage() {
  const { user, refresh } = useAuth();
  const { push } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  if (user?.role !== "brand") {
    return (
      <EmptyState
        title="Abonelik marka hesaplarına özel"
        body="İçerik üreticileri için temel kullanım ücretsizdir."
      />
    );
  }

  async function subscribe(tier: SubscriptionTier) {
    setLoading(tier);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      push(data.error || "Abonelik başarısız", "err");
      return;
    }
    await refresh();
    push(`${tierLabel(tier)} aktif · jetonlar yüklendi`);
  }

  return (
    <div>
      <PageHeader
        kicker="Abonelik"
        title="Marka planları"
        subtitle={`Aktif plan: ${tierLabel(user.subscriptionTier)}. Abonelik olmadan havuza erişim ve teklif kapalıdır.`}
      />
      <div className="grid gap-3 lg:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.tier}
            className={`flex h-full flex-col ${
              p.highlighted ? "border-accent shadow-[var(--shadow-md)]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                {p.name}
              </p>
              {user.subscriptionTier === p.tier ? (
                <span className="rounded-md bg-accent-wash px-2 py-0.5 text-[11px] font-semibold text-accent">
                  Aktif
                </span>
              ) : null}
            </div>
            <p className="mt-3 font-display text-4xl text-ink">
              {p.price}
              <span className="ml-1 text-base text-muted">TL/ay</span>
            </p>
            <p className="mt-1 text-xs text-muted">+{p.tokens} teklif jetonu</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-slate">
                  <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={p.highlighted ? "primary" : "outline"}
              disabled={loading === p.tier}
              onClick={() => subscribe(p.tier)}
            >
              {user.subscriptionTier === p.tier ? "Planı yenile" : "Bu plana geç"}
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted">
        İşlem komisyonu ayrıca %10’dur. Her teklif 150 jeton tüketir.
      </p>
    </div>
  );
}
