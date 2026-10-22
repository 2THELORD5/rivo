"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
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

export default function CollaborationsPage() {
  const [list, setList] = useState<Collab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collaborations")
      .then((r) => r.json())
      .then((d) => setList(d.collaborations ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        kicker="İşbirlikleri"
        title="İşler"
        subtitle="Tekliften ödemeye kadar tüm durumlar burada."
      />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="Aktif iş yok"
          body="Kabul edilmiş bir teklif bu listeye düşer."
        />
      ) : (
        <Stagger className="grid gap-3 md:grid-cols-2" fast>
          {list.map((c) => (
            <StaggerItem key={c.id}>
              <Link href={`/app/collaborations/${c.id}`}>
                <Card interactive className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.influencerName} size={42} />
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
