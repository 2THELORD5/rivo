"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X"];

export default function NewJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    niche: "Güzellik",
    description: "",
    contentType: "1 Reels + 3 Story",
    budgetMin: 10000,
    budgetMax: 20000,
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    usageRightsDays: 90,
    revisions: 2,
    platforms: ["Instagram"] as string[],
  });

  if (user && user.role !== "brand") {
    return (
      <div>
        <PageHeader
          kicker="İş ilanları"
          title="Yetkisiz"
          subtitle="Sadece markalar iş ilanı yayınlayabilir."
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/app/jobs")}
        >
          İlanlara dön
        </Button>
      </div>
    );
  }

  function togglePlatform(p: string) {
    setForm((f) => {
      const has = f.platforms.includes(p);
      if (has && f.platforms.length === 1) return f;
      return {
        ...f,
        platforms: has
          ? f.platforms.filter((x) => x !== p)
          : [...f.platforms, p],
      };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      push(data.error || "İlan oluşturulamadı", "err");
      return;
    }
    push("İlan yayınlandı");
    router.push(`/app/jobs/${data.job.id}`);
  }

  return (
    <div>
      <Link
        href="/app/jobs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> İlanlar
      </Link>
      <PageHeader
        kicker="Yeni ilan"
        title="İş ilanı yayınla"
        subtitle="Bütçe bandı ve brief net olsun; üreticiler buna göre teklif verir."
      />

      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
        <Card>
          <div className="space-y-3">
            <Input
              label="Başlık"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn. Yaz serum kampanyası — Reels"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Niş"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
              <Input
                label="İçerik tipi"
                value={form.contentType}
                onChange={(e) =>
                  setForm({ ...form, contentType: e.target.value })
                }
              />
            </div>
            <Textarea
              label="Açıklama / brief"
              required
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Kampanya amacı, teslim beklentisi, zorunlu mesajlar…"
            />
          </div>
        </Card>

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Min. bütçe (TL)"
              type="number"
              min={1000}
              value={form.budgetMin}
              onChange={(e) =>
                setForm({ ...form, budgetMin: Number(e.target.value) })
              }
            />
            <Input
              label="Max. bütçe (TL)"
              type="number"
              min={1000}
              value={form.budgetMax}
              onChange={(e) =>
                setForm({ ...form, budgetMax: Number(e.target.value) })
              }
            />
            <Input
              label="Teslim tarihi"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Kullanım hakkı (gün)"
              type="number"
              min={30}
              value={form.usageRightsDays}
              onChange={(e) =>
                setForm({ ...form, usageRightsDays: Number(e.target.value) })
              }
            />
            <Input
              label="Revizyon"
              type="number"
              min={0}
              max={5}
              value={form.revisions}
              onChange={(e) =>
                setForm({ ...form, revisions: Number(e.target.value) })
              }
            />
          </div>
          <div className="mt-4">
            <p className="mb-1.5 text-[12px] font-medium text-slate">
              Platformlar
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const on = form.platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={
                      on
                        ? "rounded-lg bg-[#ff4d6d] px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-lg bg-wash px-3 py-1.5 text-xs font-medium text-slate"
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/app/jobs")}
          >
            Vazgeç
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Yayınlanıyor…" : "İlanı yayınla"}
          </Button>
        </div>
      </form>
    </div>
  );
}
