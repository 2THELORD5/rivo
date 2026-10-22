"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, Button, Card, Input, Logo } from "@/components/ui";
import { MagneticButton } from "@/components/motion-ui";
import { BRAND } from "@/lib/brand";
import type { Role } from "@/lib/types";
import { easeOut } from "@/lib/motion";

const demos = [
  {
    role: "brand" as Role,
    email: "brand@rivo.demo",
    name: "Nova Kozmetik",
    meta: "Marka · Growth",
  },
  {
    role: "influencer" as Role,
    email: "influencer@rivo.demo",
    name: "Ada Yılmaz",
    meta: "Üretici · Güzellik",
  },
  {
    role: "agency" as Role,
    email: "agency@rivo.demo",
    name: "Atlas Ajans",
    meta: "Ajans · 6 üretici",
  },
];

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.7H12z"
      />
    </svg>
  );
}

function LoginForm() {
  const { login, loginOAuth } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const preferred = (params.get("role") as Role | null) ?? "brand";
  const wantAdmin = params.get("admin") === "1";
  const [email, setEmail] = useState(
    demos.find((d) => d.role === preferred)?.email ?? demos[0].email,
  );
  const [oauthRole, setOauthRole] = useState<Role>(
    preferred === "agency" ? "brand" : preferred,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(wantAdmin);
  const [adminUser, setAdminUser] = useState("rivoadmin");
  const [adminPass, setAdminPass] = useState("");

  async function goAfter(user: { onboardingCompleted?: boolean }) {
    router.push(user.onboardingCompleted === false ? "/onboarding" : "/app");
  }

  async function submitEmail(next?: string) {
    setLoading(true);
    setError("");
    try {
      await login(next ?? email);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function submitOAuth(provider: "apple" | "google") {
    setLoading(true);
    setError("");
    try {
      const user = await loginOAuth(provider, oauthRole);
      await goAfter(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }

  async function submitAdmin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yönetici girişi başarısız");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yönetici girişi başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-wash">
      <div className="orb-a pointer-events-none absolute -top-20 -right-10 h-64 w-64 rounded-full bg-[#ff4d6d]/25 blur-3xl" />
      <div className="orb-b pointer-events-none absolute bottom-0 -left-10 h-72 w-72 rounded-full bg-[#7c5cff]/25 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <Link href="/">
            <Logo />
          </Link>
          <h1 className="font-display mt-8 text-4xl text-ink md:text-5xl">
            {BRAND.name}’ya hoş geldin
          </h1>
          <p className="mt-3 max-w-sm text-muted">{BRAND.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
        >
          <Card className="space-y-4 !shadow-[var(--shadow-md)]">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              Hızlı giriş
            </p>
            <div className="flex gap-2">
              {(
                [
                  ["brand", "Marka"],
                  ["influencer", "Üretici"],
                ] as const
              ).map(([r, label]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setOauthRole(r)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    oauthRole === r
                      ? "bg-ink text-white"
                      : "bg-wash-2 text-slate"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => submitOAuth("apple")}
              >
                <AppleIcon /> Apple
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => submitOAuth("google")}
              >
                <GoogleIcon /> Google
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted">
              Şimdilik OAuth simülasyonu — tıklayınca otomatik giriş + profil kurulumu
            </p>

            <div className="relative py-1 text-center text-[11px] text-muted">
              <span className="relative z-10 bg-paper px-2">veya e-posta</span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
            </div>

            <Input
              label="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AnimatePresence>
              {error ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-rose"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>
            <MagneticButton className="w-full">
              <Button className="w-full" disabled={loading} onClick={() => submitEmail()}>
                {loading ? "Giriş…" : "Devam et"}
              </Button>
            </MagneticButton>
          </Card>

          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              Demo hesaplar
            </p>
            {demos.map((d, i) => (
              <motion.button
                key={d.email}
                type="button"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setEmail(d.email);
                  void submitEmail(d.email);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper px-3.5 py-3 text-left shadow-[var(--shadow-xs)]"
              >
                <Avatar name={d.name} size={40} />
                <span>
                  <span className="block text-sm font-semibold text-ink">{d.name}</span>
                  <span className="block text-xs text-muted">{d.meta}</span>
                </span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper/80 p-4">
            <button
              type="button"
              onClick={() => setShowAdmin((v) => !v)}
              className="text-xs font-semibold tracking-[0.12em] text-muted uppercase hover:text-ink"
            >
              {showAdmin ? "Yönetici girişi ▴" : "Yönetici girişi ▾"}
            </button>
            <AnimatePresence>
              {showAdmin ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3 overflow-hidden"
                >
                  <Input
                    label="Kullanıcı adı"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    autoComplete="username"
                  />
                  <Input
                    label="Şifre"
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => void submitAdmin()}
                  >
                    Admin paneline gir
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted">Yükleniyor…</div>}>
      <LoginForm />
    </Suspense>
  );
}
