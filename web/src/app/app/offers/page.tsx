"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Handshake } from "lucide-react";
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
import { formatDate, formatTL, offerStatusLabel } from "@/lib/format";

type Offer = {
  id: string;
  title: string;
  budget: number;
  counterBudget?: number;
  status: "pending" | "countered" | "accepted" | "rejected" | "cancelled";
  brandName: string;
  influencerName: string;
  influencerHandle: string;
  contentType: string;
  dueDate: string;
  brief: string;
  collaborationId?: string | null;
};

const tone = {
  pending: "warn" as const,
  countered: "blue" as const,
  accepted: "accent" as const,
  rejected: "danger" as const,
  cancelled: "neutral" as const,
};

type Filter = "all" | "open" | "done";

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((d) => setOffers(d.offers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const open = offers.filter((o) =>
      ["pending", "countered"].includes(o.status),
    ).length;
    const done = offers.filter((o) =>
      ["accepted", "rejected", "cancelled"].includes(o.status),
    ).length;
    return { all: offers.length, open, done };
  }, [offers]);

  const list = useMemo(() => {
    if (filter === "open")
      return offers.filter((o) => ["pending", "countered"].includes(o.status));
    if (filter === "done")
      return offers.filter((o) =>
        ["accepted", "rejected", "cancelled"].includes(o.status),
      );
    return offers;
  }, [offers, filter]);

  return (
    <div>
      <PageHeader
        kicker="Teklifler"
        title="Teklif kutusu"
        subtitle="Düzenle, müzakere et, kabul et — her teklifin detay ve sohbeti ayrı sayfada."
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
          active={filter === "open"}
          onClick={() => setFilter("open")}
          count={counts.open}
        >
          Açık
        </FilterChip>
        <FilterChip
          active={filter === "done"}
          onClick={() => setFilter("done")}
          count={counts.done}
        >
          Kapalı
        </FilterChip>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Henüz teklif yok"
          body={
            user?.role === "brand"
              ? "Keşfet’ten üretici seçip ilk teklifini gönder."
              : "Markalar sana teklif gönderdiğinde burada görünür."
          }
          action={
            user?.role === "brand" ? (
              <ButtonLink href="/app/discover">Üretici keşfet</ButtonLink>
            ) : undefined
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Bu filtrede teklif yok"
          body="Filtreyi değiştirerek diğer teklifleri görebilirsin."
          action={
            <button
              type="button"
              className="text-sm font-semibold text-[#ff4d6d]"
              onClick={() => setFilter("all")}
            >
              Tümünü göster
            </button>
          }
        />
      ) : (
        <Stagger className="space-y-3" fast>
          {list.map((o) => (
            <StaggerItem key={o.id}>
              <Link href={`/app/offers/${o.id}`}>
                <Card interactive>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={
                          user?.role === "brand"
                            ? o.influencerName
                            : o.brandName
                        }
                        size={42}
                      />
                      <div>
                        <p className="text-[15px] font-semibold text-ink">
                          {o.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {o.brandName} → @{o.influencerHandle}
                        </p>
                      </div>
                    </div>
                    <Badge tone={tone[o.status]}>
                      {offerStatusLabel(o.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate">{o.brief}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span>
                        <span className="text-muted">Bütçe </span>
                        <span className="font-semibold text-ink tabular">
                          {formatTL(o.budget)}
                        </span>
                      </span>
                      <span>
                        <span className="text-muted">Teslim </span>
                        <span className="font-semibold text-ink">
                          {formatDate(o.dueDate)}
                        </span>
                      </span>
                      <span className="text-muted">{o.contentType}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff4d6d]">
                      Detay <ArrowUpRight size={13} />
                    </span>
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
