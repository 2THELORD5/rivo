"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import { MagneticButton, Reveal } from "@/components/motion-ui";
import { BRAND } from "@/lib/brand";
import { easeOut } from "@/lib/motion";

const reel = [
  "Brief → teklif → sözleşme",
  "Ödeme havuzu · şeffaf takip",
  "Taslak onayı · yayın kontrolü",
  "Marka × üretici × ajans",
  "Tek panel · tek akış",
  "Teslim · serbest bırakma",
];

export default function HomePage() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="bg-[#0a0614] text-white">
      <section
        ref={heroRef}
        className="relative min-h-[100svh] overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(255,77,109,0.55), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 15%, rgba(124,92,255,0.5), transparent 50%), radial-gradient(ellipse 60% 50% at 70% 85%, rgba(34,211,238,0.35), transparent 55%), linear-gradient(160deg, #1a0b2e 0%, #12081f 50%, #0b1220 100%)",
        }}
      >
        <div className="orb-a pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#ff4d6d]/50 blur-3xl" />
        <div className="orb-b pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-[#7c5cff]/45 blur-3xl" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute h-44 w-44 rounded-full bg-white/10 blur-2xl"
          style={{ left: sx, top: sy, x: "-50%", y: "-50%" }}
        />

        <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(1.1rem,env(safe-area-inset-top))] pb-4 md:px-8 md:py-5">
          <Logo invert />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white/70 hover:text-white sm:block"
            >
              Giriş
            </Link>
            <MagneticButton>
              <Link href="/login">
                <Button size="sm" variant="secondary" className="!bg-white !text-ink hover:!bg-white/90">
                  Başla
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </header>

        <motion.div
          style={{ scale: heroScale }}
          className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] max-w-6xl flex-col justify-center px-5 pb-[max(5rem,env(safe-area-inset-bottom))] md:px-8 md:pb-20"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold tracking-wide"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Marka × üretici işbirliği
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
            className="font-display mt-3 text-[clamp(3.4rem,16vw,8rem)] leading-[0.88] font-extrabold tracking-tight"
            style={{
              color: "#ffffff",
              WebkitTextFillColor: "#ffffff",
              opacity: 1,
              textShadow:
                "0 2px 0 rgba(255,255,255,0.12), 0 12px 48px rgba(255,77,109,0.55), 0 0 80px rgba(124,92,255,0.35)",
            }}
          >
            {BRAND.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 max-w-md text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Brief’ten teslime tek akış — canlı, hızlı, şeffaf.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <MagneticButton>
              <Link href="/login?role=brand">
                <Button size="lg" className="btn-gradient">
                  Marka olarak başla <ArrowRight size={17} />
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/login?role=influencer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/18"
                >
                  <Play size={15} fill="currentColor" /> Üretici ol
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Infinite reel */}
        <div className="relative z-10 border-t border-white/10 bg-black/20 py-3 backdrop-blur">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            {[...reel, ...reel].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="inline-flex items-center gap-3 text-sm font-medium text-white/70"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d6d]" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Markalar", d: "Keşfet, teklif at, teslimi izle." },
            { t: "Üreticiler", d: "Teklif al, şartları netleştir." },
            { t: "Ajanslar", d: "Kadro ve işler tek panelde." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div
                  className="mb-3 h-1.5 w-10 rounded-full"
                  style={{
                    background: ["#ff4d6d", "#7c5cff", "#22d3ee"][i],
                  }}
                />
                <h3 className="font-display text-2xl">{c.t}</h3>
                <p className="mt-2 text-sm text-white/60">{c.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-[#ff4d6d]/20 via-[#7c5cff]/20 to-[#22d3ee]/10 px-7 py-10 md:flex-row md:items-center md:px-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Hazır mısın?</h2>
              <p className="mt-2 text-sm text-white/65">
                Demo hesaplarla veya Apple / Google ile hemen dene.
              </p>
            </div>
            <MagneticButton>
              <Link href="/login">
                <Button size="lg" className="bg-white text-ink hover:bg-white/90">
                  Platforma gir <ArrowRight size={17} />
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </Reveal>

        <footer className="mt-10 flex items-center justify-between text-xs text-white/40">
          <span>
            {BRAND.name} · {BRAND.domain}
          </span>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </section>
    </div>
  );
}
