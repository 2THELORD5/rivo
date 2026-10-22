"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  ChevronDown,
  FileSearch,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, Logo } from "./ui";
import { PageEnter } from "./motion-ui";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

const navByRole = {
  brand: [
    { href: "/app", label: "Özet", icon: LayoutDashboard },
    { href: "/app/discover", label: "Keşfet", icon: Users },
    { href: "/app/offers", label: "Teklifler", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", icon: MessageSquare, badge: true },
    { href: "/app/subscription", label: "Abonelik", icon: Sparkles },
  ],
  influencer: [
    { href: "/app", label: "Özet", icon: LayoutDashboard },
    { href: "/app/profile", label: "Medya kiti", icon: UserRound },
    { href: "/app/offers", label: "Teklifler", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", icon: MessageSquare, badge: true },
    { href: "/app/contract-scan", label: "Sözleşme", icon: FileSearch },
    { href: "/app/tax", label: "Vergi", icon: Building2 },
  ],
  agency: [
    { href: "/app", label: "Panel", icon: LayoutDashboard },
    { href: "/app/offers", label: "Teklifler", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", icon: MessageSquare, badge: true },
    { href: "/app/roster", label: "Kadro", icon: Users },
  ],
};

const roleLabel = {
  brand: "Marka",
  influencer: "Üretici",
  agency: "Ajans",
};

type Note = {
  id: string;
  title: string;
  body: string;
  href: string;
  at: string;
};

function ProfileMenu({
  org,
  role,
  email,
  name,
  onLogout,
  onClose,
}: {
  org: string;
  role: string;
  email: string;
  name: string;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="z-40 w-56 overflow-hidden rounded-xl border border-line bg-paper shadow-[var(--shadow-md)]"
    >
      <div className="border-b border-line px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-ink">{org}</p>
        <p className="truncate text-[11px] text-muted">
          {role} · {email}
        </p>
      </div>
      <Link
        href="/app/settings"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-wash"
      >
        <Settings size={15} /> Hesap ayarları
      </Link>
      <Link
        href="/app/messages"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-wash"
      >
        <MessageSquare size={15} /> Mesajlar
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-sm text-rose hover:bg-rose-wash"
      >
        <LogOut size={15} /> Çıkış yap
      </button>
      <span className="sr-only">{name}</span>
    </motion.div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [openBell, setOpenBell] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.onboardingCompleted === false) {
      router.replace("/onboarding");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.onboardingCompleted === false) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotes(d.notifications ?? []))
      .catch(() => undefined);
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setUnread(d.unread ?? 0))
      .catch(() => undefined);
    const t = window.setInterval(() => {
      fetch("/api/messages")
        .then((r) => r.json())
        .then((d) => setUnread(d.unread ?? 0))
        .catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(t);
  }, [user, pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (!profileRef.current?.contains(t) && !mobileProfileRef.current?.contains(t)) {
        setOpenProfile(false);
      }
      if (!bellRef.current?.contains(t)) setOpenBell(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (loading || !user || user.onboardingCompleted === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wash">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Logo />
          <div className="skeleton h-1 w-24" />
        </motion.div>
      </div>
    );
  }

  const nav = navByRole[user.role];
  const org =
    user.role === "brand"
      ? user.brandName
      : user.role === "agency"
        ? user.agencyName
        : user.name;

  async function doLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col px-3 py-4">
          <Link href="/" className="mb-7 px-2.5">
            <Logo />
          </Link>

          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                    active ? "text-ink" : "text-muted hover:bg-wash hover:text-ink",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-wash-2 ring-1 ring-black/5"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon
                      size={16}
                      strokeWidth={active ? 2.1 : 1.7}
                      className={active ? "text-[#ff4d6d]" : undefined}
                    />
                    {item.label}
                    {"badge" in item && item.badge && unread > 0 ? (
                      <span className="rounded-full bg-[#ff4d6d] px-1.5 text-[10px] font-bold text-white tabular">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-line pt-3 lg:block">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile((v) => !v)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left transition hover:bg-wash"
              >
                <Avatar name={user.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{org}</p>
                  <p className="truncate text-[11px] text-muted">
                    {roleLabel[user.role]} · {user.email.split("@")[0]}
                  </p>
                </div>
                <ChevronDown size={14} className="text-muted" />
              </button>
              <AnimatePresence>
                {openProfile ? (
                  <div className="absolute bottom-[calc(100%+6px)] left-0 right-0">
                    <ProfileMenu
                      org={org ?? user.name}
                      role={roleLabel[user.role]}
                      email={user.email}
                      name={user.name}
                      onClose={() => setOpenProfile(false)}
                      onLogout={() => void doLogout()}
                    />
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-wash/80 px-4 py-3 backdrop-blur md:px-8">
          <p className="truncate text-sm font-medium text-ink lg:text-muted">
            <span className="lg:hidden">{org}</span>
            <span className="hidden lg:inline">{roleLabel[user.role]} paneli</span>
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/app/messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-slate transition hover:text-ink"
            >
              <MessageSquare size={17} />
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4d6d] px-1 text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setOpenBell((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-slate transition hover:text-ink"
              >
                <Bell size={17} />
                {notes.length > 0 ? (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ff4d6d]" />
                ) : null}
              </button>
              <AnimatePresence>
                {openBell ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-md)]"
                  >
                    <div className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
                      Bildirimler
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notes.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted">Yeni bildirim yok.</p>
                      ) : (
                        notes.map((n) => (
                          <Link
                            key={n.id}
                            href={n.href}
                            onClick={() => setOpenBell(false)}
                            className="block border-b border-line px-4 py-3 last:border-0 hover:bg-wash"
                          >
                            <p className="text-sm font-semibold text-ink">{n.title}</p>
                            <p className="text-xs text-muted">{n.body}</p>
                            <p className="mt-1 text-[11px] text-muted">
                              {formatDateTime(n.at)}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="relative lg:hidden" ref={mobileProfileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile((v) => !v)}
                className="rounded-full ring-1 ring-black/5"
              >
                <Avatar name={user.name} size={36} />
              </button>
              <AnimatePresence>
                {openProfile ? (
                  <div className="absolute right-0 mt-2">
                    <ProfileMenu
                      org={org ?? user.name}
                      role={roleLabel[user.role]}
                      email={user.email}
                      name={user.name}
                      onClose={() => setOpenProfile(false)}
                      onLogout={() => void doLogout()}
                    />
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <main className="px-4 py-5 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <PageEnter key={pathname}>{children}</PageEnter>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
