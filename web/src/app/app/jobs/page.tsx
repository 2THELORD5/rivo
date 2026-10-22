"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Briefcase, Plus } from "lucide-react";
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
import { formatDate, formatTL, jobStatusLabel } from "@/lib/format";

type Job = {
  id: string;
  title: string;
  niche: string;
  description: string;
  contentType: string;
  budgetMin: number;
  budgetMax: number;
  dueDate: string;
  platforms: string[];
  status: "open" | "closed" | "filled";
  brandName: string;
  applicationCount: number;
  pendingCount: number;
  createdAt: string;
};

const tone = {
  open: "accent" as const,
  closed: "neutral" as const,
  filled: "blue" as const,
};

type Filter = "all" | "open" | "closed";

export default function JobsPage() {
  const { user } = useAuth();
  const isBrand = user?.role === "brand";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const open = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.filter((j) => j.status !== "open").length;
    return { all: jobs.length, open, closed };
  }, [jobs]);

  const list = useMemo(() => {
    if (filter === "open") return jobs.filter((j) => j.status === "open");
    if (filter === "closed") return jobs.filter((j) => j.status !== "open");
    return jobs;
  }, [jobs, filter]);

  return (
    <div>
      <PageHeader
        kicker="İş ilanları"
        title={isBrand ? "İlanlarım" : "Açık işler"}
        subtitle={
          isBrand
            ? "Kampanya ilanı yayınla, üretici tekliflerini incele ve kabul et."
            : "Markaların açık ilanlarına bütçe ve pitch ile teklif ver."
        }
        action={
          isBrand ? (
            <ButtonLink href="/app/jobs/new">
              <Plus size={15} /> Yeni ilan
            </ButtonLink>
          ) : undefined
        }
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
          active={filter === "closed"}
          onClick={() => setFilter("closed")}
          count={counts.closed}
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={isBrand ? "Henüz ilan yok" : "Açık ilan yok"}
          body={
            isBrand
              ? "İlk iş ilanını yayınla; üreticiler teklif göndersin."
              : "Markalar ilan açtığında burada listelenir."
          }
          action={
            isBrand ? (
              <ButtonLink href="/app/jobs/new">İlan oluştur</ButtonLink>
            ) : undefined
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Bu filtrede ilan yok"
          body="Filtreyi değiştirerek diğer ilanları görebilirsin."
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
          {list.map((j) => (
            <StaggerItem key={j.id}>
              <Link href={`/app/jobs/${j.id}`}>
                <Card interactive>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={j.brandName || j.title} size={42} />
                      <div>
                        <p className="text-[15px] font-semibold text-ink">
                          {j.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {j.brandName}
                          {j.niche ? ` · ${j.niche}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge tone={tone[j.status]}>
                      {jobStatusLabel(j.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate">
                    {j.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span>
                        <span className="text-muted">Bütçe </span>
                        <span className="font-semibold text-ink tabular">
                          {formatTL(j.budgetMin)} – {formatTL(j.budgetMax)}
                        </span>
                      </span>
                      <span>
                        <span className="text-muted">Teslim </span>
                        <span className="font-semibold text-ink">
                          {formatDate(j.dueDate)}
                        </span>
                      </span>
                      {isBrand ? (
                        <span className="text-muted">
                          {j.applicationCount} teklif
                          {j.pendingCount
                            ? ` · ${j.pendingCount} bekleyen`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-muted">{j.contentType}</span>
                      )}
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
