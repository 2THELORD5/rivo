"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  FilterChip,
  PageHeader,
} from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion-ui";
import { collabStatusLabel, formatTL } from "@/lib/format";

type Collab = {
  id: string;
  title: string;
  status: string;
  amount: number;
  escrowHeld: boolean;
  brandName: string;
  influencerName: string;
  influencerHandle: string;
};

const toneMap: Record<
  string,
  "accent" | "warn" | "danger" | "neutral" | "blue" | "ink"
> = {
  funded: "accent",
  in_progress: "blue",
  content_review: "warn",
  published: "accent",
  disputed: "danger",
  paid: "neutral",
  accepted: "warn",
  cancelled: "danger",
};

type Filter = "all" | "active" | "closed";

export default function CollaborationsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Collab[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((d) => setList(d.collaborations ?? []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const active = list.filter(
      (c) => !["paid", "cancelled"].includes(c.status),
    ).length;
    const closed = list.filter((c) =>
      ["paid", "cancelled"].includes(c.status),
    ).length;
    return { all: list.length, active, closed };
  }, [list]);

  const filtered = useMemo(() => {
    if (filter === "active")
      return list.filter((c) => !["paid", "cancelled"].includes(c.status));
    if (filter === "closed")
      return list.filter((c) => ["paid", "cancelled"].includes(c.status));
    return list;
  }, [list, filter]);

  return (
    <div>
      <PageHeader
        kicker="İşbirlikleri"
        title="İşler"
        subtitle="Tekliften ödemeye — durum, escrow ve sohbet tek kayıtta."
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          count={counts.all}
        >
          Tümü
        </FilterChip>
        <FilterChip
          active={filter === "active"}
          onClick={() => setFilter("active")}
          count={counts.active}
        >
          Aktif
        </FilterChip>
        <FilterChip
          active={filter === "closed"}
          onClick={() => setFilter("closed")}
          count={counts.closed}
        >
          Kapalı
        </FilterChip>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aktif iş yok"
          body="Kabul edilmiş bir teklif otomatik olarak bu listeye düşer."
          action={
            <ButtonLink href="/app/offers" variant="outline">
              Tekliflere git
            </ButtonLink>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Bu filtrede iş yok"
          body="Başka bir filtre seç."
        />
      ) : (
        <Stagger className="grid gap-3 md:grid-cols-2" fast>
          {filtered.map((c) => (
            <StaggerItem key={c.id}>
              <Link href={`/app/collaborations/${c.id}`}>
                <Card interactive className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={
                          user?.role === "brand"
                            ? c.influencerName
                            : c.brandName
                        }
                        size={42}
                      />
                      <div>
                        <p className="text-[15px] font-semibold text-ink">
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {c.brandName} · @{c.influencerHandle}
                        </p>
                      </div>
                    </div>
                    <Badge tone={toneMap[c.status] ?? "neutral"}>
                      {collabStatusLabel(c.status as never)}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink tabular">
                      {formatTL(c.amount)}
                    </p>
                    {c.escrowHeld ? (
                      <Badge tone="accent" pulse>
                        Havuzda
                      </Badge>
                    ) : null}
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
