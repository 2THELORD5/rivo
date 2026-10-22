"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input, Logo, Textarea } from "@/components/ui";
import type { Role } from "@/lib/types";
import { easeOut } from "@/lib/motion";

export default function OnboardingPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role>("influencer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    brandName: "",
    agencyName: "",
    phone: "",
    website: "",
    city: "İstanbul",
    industry: "Güzellik",
    taxId: "",
    handle: "",
    niche: "Lifestyle",
    bio: "",
    minBudget: 5000,
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.onboardingCompleted) router.replace("/app");
    if (user) {
      setRole(user.role === "agency" ? "brand" : user.role);
      setForm((f) => ({
        ...f,
        name: user.name || "",
        brandName: user.brandName || "",
      }));
    }
  }, [user, loading, router]);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Kayıt tamamlanamadı");
      return;
    }
    setUser(data.user);
    router.push("/app");
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="skeleton h-8 w-40" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-wash px-5 py-10">
      <div className="orb-a pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-[#ff4d6d]/20 blur-3xl" />
      <div className="orb-b pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#7c5cff]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="relative z-10 mx-auto max-w-xl"
      >
        <Logo />
        <h1 className="font-display mt-8 text-3xl text-ink md:text-4xl">
          Profilini tamamla
        </h1>
        <p className="mt-2 text-sm text-muted">
          Rolüne göre birkaç bilgi — sonra panele geçersin.
        </p>

        <div className="mt-6 flex gap-2">
          {(
            [
              ["influencer", "Üreticiyim"],
              ["brand", "Şirket / markayım"],
              ["agency", "Ajansım"],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-semibold sm:text-sm ${
                role === r ? "btn-gradient text-white" : "bg-paper text-slate border border-line"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Card className="mt-5 space-y-3 !shadow-[var(--shadow-sm)]">
          <Input
            label="Ad Soyad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="05xx xxx xx xx"
          />
          <Input
            label="Şehir"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          {role === "influencer" ? (
            <>
              <Input
                label="Kullanıcı adı (handle)"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="adayilmaz"
              />
              <Input
                label="Niş"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
              />
              <Input
                label="Minimum bütçe (TL)"
                type="number"
                value={form.minBudget}
                onChange={(e) =>
                  setForm({ ...form, minBudget: Number(e.target.value) })
                }
              />
              <Textarea
                label="Kısa bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </>
          ) : null}

          {role === "brand" ? (
            <>
              <Input
                label="Şirket / marka adı"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              />
              <Input
                label="Sektör"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
              <Input
                label="Web sitesi"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://"
              />
              <Input
                label="Vergi no (opsiyonel)"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              />
            </>
          ) : null}

          {role === "agency" ? (
            <>
              <Input
                label="Ajans adı"
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
              />
              <Input
                label="Web sitesi"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </>
          ) : null}

          {error ? <p className="text-sm text-rose">{error}</p> : null}
          <Button className="w-full" disabled={busy || !form.name} onClick={submit}>
            {busy ? "Kaydediliyor…" : "Panele geç"}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
