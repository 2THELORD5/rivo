"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion-ui";
import { formatNumber, formatTL } from "@/lib/format";

type Inf = {
  id: string;
  name: string;
  handle: string;
  niche: string;
  city: string;
  bio: string;
  minBudget: number;
  tags: string[];
  reliabilityScore: number;
  monthlyReach: number;
  agencyName?: string;
  platforms: {
    name: string;
    followers: number;
    engagement: number;
    verified: boolean;
  }[];
};

const niches = [
  "Tümü",
  "Güzellik",
  "Oyun",
  "Lifestyle",
  "Finans",
  "Yemek",
  "Spor",
  "Moda",
  "Teknoloji",
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Inf[]>([]);
  const [niche, setNiche] = useState("Tümü");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ niche, q });
    fetch(`/api/influencers?${params}`)
      .then((r) => r.json())
      .then((d) => setList(d.influencers ?? []))
      .finally(() => setLoading(false));
  }, [niche, q]);

  if (user?.role !== "brand") {
    return (
      <EmptyState
        title="Bu alan marka hesaplarına açık"
        body="Üretici veya ajans hesabıyla keşif kullanılmaz."
      />
    );
  }

  if (!user.subscriptionTier) {
    return (
      <div>
        <PageHeader
          kicker="Keşfet"
          title="Abonelik gerekli"
          subtitle="Havuza erişim için aktif bir marka planı gerekir."
        />
        <Card className="max-w-lg">
          <p className="text-sm text-muted">
            Plan seçerek doğrulanmış üretici listesine erişin.
          </p>
          <Link href="/app/subscription" className="mt-4 inline-block">
            <Button>Planları gör</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        kicker="Keşfet"
        title="Üretici havuzu"
        subtitle="Takipçi ve etkileşim verileri bağlı hesaplardan gelir."
      />

      <motion.div
        layout
        className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, kullanıcı adı veya etiket"
            className="h-11 w-full rounded-[11px] border border-line-strong bg-paper pr-3 pl-10 text-sm outline-none transition focus:border-[#ff4d6d] focus:shadow-[0_0_0_3px_rgba(255,77,109,0.15)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {niches.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className="relative rounded-full px-3 py-1.5 text-[12px] font-semibold"
            >
              {niche === n ? (
                <motion.span
                  layoutId="niche-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full border border-line bg-paper" />
              )}
              <span
                className={`relative z-10 ${niche === n ? "text-white" : "text-slate"}`}
              >
                {n}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-56" />
          ))}
        </div>
      ) : (
        <Stagger className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" fast>
          {list.map((inf) => {
            const top = [...inf.platforms].sort(
              (a, b) => b.followers - a.followers,
            )[0];
            return (
              <StaggerItem key={inf.id}>
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-start gap-3">
                    <Avatar name={inf.name} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {inf.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            @{inf.handle} · {inf.city}
                          </p>
                        </div>
                        <Badge tone="neutral">{inf.niche}</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate">
                    {inf.bio}
                  </p>

                  <div className="mt-4 rounded-xl bg-wash px-3 py-2.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="inline-flex items-center gap-1 font-medium text-ink">
                        {top?.name}
                        {top?.verified ? (
                          <BadgeCheck size={13} className="text-[var(--accent)]" />
                        ) : null}
                      </span>
                      <span className="text-muted tabular">
                        {formatNumber(top?.followers ?? 0)} · %{top?.engagement}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Erişim {formatNumber(inf.monthlyReach)} · güven %
                      {inf.reliabilityScore}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      <p className="text-[11px] text-muted">Min. bütçe</p>
                      <p className="text-sm font-semibold text-ink tabular">
                        {formatTL(inf.minBudget)}
                      </p>
                    </div>
                    <Link href={`/app/discover/${inf.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline">
                        İncele
                      </Button>
                    </Link>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
