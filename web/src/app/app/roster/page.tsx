"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { formatNumber, formatTL } from "@/lib/format";

export default function RosterPage() {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<Array<Record<string, unknown>>>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "agency") return;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setInfluencers(d.influencers ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== "agency") {
    return (
      <EmptyState
        title="Ajans kadrosu"
        body="Bu ekran yalnızca ajans hesapları içindir."
      />
    );
  }

  return (
    <div>
      <PageHeader
        kicker="Kadro"
        title="Temsil edilen üreticiler"
        subtitle="Anlaşma, sözleşme ve ödeme takibi tek panelden yürütülür."
      />
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {influencers.map((inf) => (
            <Card key={String(inf.id)}>
              <div className="flex items-start gap-3">
                <Avatar name={String(inf.name)} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {String(inf.name)}
                      </p>
                      <p className="text-xs text-muted">@{String(inf.handle)}</p>
                    </div>
                    <Badge tone="neutral">{String(inf.niche)}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] text-muted">Min. bütçe</p>
                      <p className="font-semibold text-ink">
                        {formatTL(Number(inf.minBudget))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted">Aylık erişim</p>
                      <p className="font-semibold text-ink">
                        {formatNumber(Number(inf.monthlyReach))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
