"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BadgeCheck, Copy, LogOut, Settings, Share2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { formatNumber, formatTL } from "@/lib/format";
import { Stagger, StaggerItem } from "@/components/motion-ui";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [inf, setInf] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (user?.role !== "influencer") return;
    fetch("/api/influencers")
      .then((r) => r.json())
      .then((d) => {
        const mine = (d.influencers ?? []).find(
          (i: { userId?: string }) => i.userId === user.id,
        );
        setInf(mine ?? null);
      });
  }, [user]);

  if (user?.role !== "influencer") {
    return (
      <EmptyState
        title="Medya kiti üreticilere özel"
        body="Marka veya ajans hesabında bu sayfa kapalı."
      />
    );
  }

  if (!inf) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  const platforms = inf.platforms as Array<{
    name: string;
    followers: number;
    engagement: number;
    verified: boolean;
  }>;

  return (
    <div>
      <PageHeader
        kicker="Medya kiti"
        title={String(inf.name)}
        subtitle={`@${inf.handle} · ${inf.city} · markalara gösterilecek vitrin`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/app/settings")}
            >
              <Settings size={14} /> Ayarlar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${window.location.origin}/app/discover/${inf.id}`,
                );
                push("Profil linki kopyalandı");
              }}
            >
              <Copy size={14} /> Link
            </Button>
            <Button
              size="sm"
              onClick={() => push("Paylaşım simülasyonu gönderildi", "info")}
            >
              <Share2 size={14} /> Paylaş
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              <LogOut size={14} /> Çıkış
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="flex items-start gap-4">
            <Avatar name={String(inf.name)} size={72} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl text-ink">{String(inf.name)}</h2>
                <Badge tone="accent">{String(inf.niche)}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">@{String(inf.handle)}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {String(inf.bio)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Aylık erişim", formatNumber(Number(inf.monthlyReach))],
              ["Min. bütçe", formatTL(Number(inf.minBudget))],
              ["Güven", `%${inf.reliabilityScore}`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-wash px-3 py-3">
                <p className="text-[11px] text-muted">{l}</p>
                <p className="mt-1 text-sm font-semibold text-ink tabular">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="border-b border-line px-5 py-3">
            <h3 className="text-sm font-semibold text-ink">Bağlı hesaplar</h3>
          </div>
          <Stagger fast>
            {platforms.map((p) => (
              <StaggerItem
                key={p.name}
                className="flex items-center justify-between border-b border-line px-5 py-3.5 last:border-0"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  {p.name}
                  {p.verified ? (
                    <BadgeCheck size={15} className="text-[#ff4d6d]" />
                  ) : null}
                </span>
                <span className="text-sm text-muted tabular">
                  {formatNumber(p.followers)} · %{p.engagement}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4"
      >
        <Card>
          <h3 className="font-display text-xl text-ink">Etiketler</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(inf.tags as string[]).map((t) => (
              <span
                key={t}
                className="rounded-full bg-violet-wash px-3 py-1 text-xs font-semibold text-[#7c5cff]"
              >
                #{t}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
