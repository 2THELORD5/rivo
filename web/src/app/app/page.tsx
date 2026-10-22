"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  PageHeader,
  Stat,
} from "@/components/ui";
import { CountUp, Stagger, StaggerItem } from "@/components/motion-ui";
import { formatDateTime, formatTL, tierLabel } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!user || !data) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-56" />
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (data.type === "agency") return <AgencyHome data={data} />;

  const first = user.name.split(" ")[0];

  return (
    <div>
      <PageHeader
        kicker="Çalışma alanı"
        title={`Merhaba, ${first}`}
        subtitle={
          user.role === "brand"
            ? `${user.brandName} · ${tierLabel(user.subscriptionTier)}`
            : "Teklifler, sözleşmeler ve ödemeler tek zaman çizelgesinde."
        }
        action={
          user.role === "brand" ? (
            <ButtonLink href="/app/discover">
              Üretici bul <ArrowUpRight size={16} />
            </ButtonLink>
          ) : (
            <ButtonLink href="/app/offers">
              Teklifler <ArrowUpRight size={16} />
            </ButtonLink>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Bekleyen teklif"
          delay={0}
          value={<CountUp value={Number(data.offersPending ?? 0)} />}
        />
        <Stat
          label="Aktif işbirliği"
          delay={0.05}
          value={<CountUp value={Number(data.activeCollabs ?? 0)} />}
        />
        <Stat
          label="Havuzdaki tutar"
          delay={0.1}
          hint="Lisanslı ödeme kuruluşunda"
          value={
            <CountUp
              value={Number(data.escrow ?? 0)}
              format={(n) => formatTL(n)}
            />
          }
        />
        <Stat
          label={user.role === "brand" ? "Teklif jetonu" : "Tamamlanan"}
          delay={0.15}
          value={
            <CountUp
              value={
                user.role === "brand"
                  ? Number(data.tokens ?? 0)
                  : Number(data.paidCount ?? 0)
              }
            />
          }
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-2xl text-ink">Son aktivite</h2>
            <Badge tone="accent" pulse>
              Canlı
            </Badge>
          </div>
          <Stagger fast>
            {(((data.activity as Array<Record<string, string>>) ?? []).length === 0
              ? [
                  {
                    id: "empty",
                    title: "Henüz hareket yok",
                    body: "Teklif veya işbirliği oluşunca burada görünür",
                    href: "/app/offers",
                    at: new Date().toISOString(),
                  },
                ]
              : (data.activity as Array<Record<string, string>>)
            ).map((a) => (
              <StaggerItem key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5 last:border-0 transition hover:bg-wash"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.title}</p>
                    <p className="truncate text-xs text-muted">{a.body}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-muted tabular">
                    {formatDateTime(a.at)}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-[var(--radius)] bg-ink p-6 text-white shadow-[var(--shadow-md)]"
          >
            <div className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 rounded-full bg-[var(--accent)]/35 blur-3xl" />
            <div className="pointer-events-none absolute -top-10 left-10 h-28 w-28 rounded-full bg-[#7c5cff]/30 blur-3xl" />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#22d3ee] uppercase">
              Sıradaki adım
            </p>
            <p className="font-display relative mt-3 text-2xl leading-snug">
              {user.role === "brand"
                ? "Havuzdaki ödemeyi yayın doğrulamasından sonra serbest bırakın."
                : "Bekleyen teklifleri yanıtlayın veya içerik aşamasını ilerletin."}
            </p>
            <Link
              href="/app/collaborations"
              className="relative mt-7 inline-flex items-center gap-1 text-sm font-semibold text-[#22d3ee]"
            >
              İşbirliklerine git <ArrowUpRight size={14} />
            </Link>
          </motion.div>

          <Card>
            <h3 className="text-sm font-semibold text-ink">Operasyon</h3>
            <Stagger className="mt-1" fast>
              {[
                ["Teklif & sözleşme", "Zorunlu alanlar"],
                ["Ödeme havuzu", "Lisanslı kuruluş"],
                ["İçerik & yayın", "Taslak + doğrulama"],
                ["Serbest bırakma", "Sözleşmeye bağlı"],
              ].map(([t, d], i) => (
                <StaggerItem
                  key={t}
                  className="flex gap-3 border-b border-line py-2.5 last:border-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wash-2 text-[11px] font-semibold text-slate tabular">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">{t}</span>
                    <span className="text-[11px] text-muted">{d}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AgencyHome({ data }: { data: Record<string, unknown> }) {
  const { user } = useAuth();
  const influencers = (data.influencers as Array<Record<string, unknown>>) ?? [];
  const collabs = (data.collabs as Array<Record<string, unknown>>) ?? [];

  return (
    <div>
      <PageHeader
        kicker="Ajans"
        title={user?.agencyName || "Ajans paneli"}
        subtitle="Teklif, sözleşme ve ödeme durumu tek panelde."
        action={
          <ButtonLink href="/app/roster" variant="outline">
            Kadroyu gör
          </ButtonLink>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Yönetilen üretici"
          value={<CountUp value={influencers.length} />}
        />
        <Stat
          label="İş hacmi"
          value={
            <CountUp
              value={Number(data.volume ?? 0)}
              format={(n) => formatTL(n)}
            />
          }
        />
        <Stat
          label="Havuzda bekleyen"
          value={<CountUp value={Number(data.pendingPay ?? 0)} />}
          hint="Ödeme serbest bırakılmamış"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-xl text-ink">Kadro</h3>
          </div>
          <Stagger fast>
            {influencers.slice(0, 6).map((inf) => (
              <StaggerItem
                key={String(inf.id)}
                className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={String(inf.name)} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{String(inf.name)}</p>
                    <p className="text-xs text-muted">
                      @{String(inf.handle)} · {String(inf.niche)}
                    </p>
                  </div>
                </div>
                <Badge tone="accent">%{String(inf.reliabilityScore)}</Badge>
              </StaggerItem>
            ))}
          </Stagger>
        </Card>

        <Card padding="none">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-xl text-ink">Son işler</h3>
          </div>
          <ul>
            {collabs.slice(0, 5).map((c, i) => (
              <motion.li
                key={String(c.id)}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-line last:border-0"
              >
                <Link
                  href={`/app/collaborations/${c.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition hover:bg-wash"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{String(c.title)}</p>
                    <p className="text-xs text-muted">{String(c.influencerName)}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink tabular">
                    {formatTL(Number(c.amount))}
                  </p>
                </Link>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
