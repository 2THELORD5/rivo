"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  Building2,
  Ellipsis,
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
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, Logo } from "./ui";
import { PageEnter } from "./motion-ui";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";

type NavItem = {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  badge?: boolean;
};

const navByRole: Record<"brand" | "influencer" | "agency", NavItem[]> = {
  brand: [
    { href: "/app", label: "Özet", short: "Özet", icon: LayoutDashboard },
    { href: "/app/discover", label: "Keşfet", short: "Keşfet", icon: Users },
    { href: "/app/jobs", label: "İş ilanları", short: "İlanlar", icon: Briefcase },
    { href: "/app/offers", label: "Teklifler", short: "Teklif", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", short: "İş", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", short: "Mesaj", icon: MessageSquare, badge: true },
    { href: "/app/subscription", label: "Abonelik", short: "Plan", icon: Sparkles },
  ],
  influencer: [
    { href: "/app", label: "Özet", short: "Özet", icon: LayoutDashboard },
    { href: "/app/profile", label: "Medya kiti", short: "Profil", icon: UserRound },
    { href: "/app/jobs", label: "İş ilanları", short: "İlanlar", icon: Briefcase },
    { href: "/app/offers", label: "Teklifler", short: "Teklif", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", short: "İş", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", short: "Mesaj", icon: MessageSquare, badge: true },
    { href: "/app/contract-scan", label: "Sözleşme", short: "Sözleşme", icon: FileSearch },
    { href: "/app/tax", label: "Vergi", short: "Vergi", icon: Building2 },
  ],
  agency: [
    { href: "/app", label: "Panel", short: "Panel", icon: LayoutDashboard },
    { href: "/app/jobs", label: "İş ilanları", short: "İlanlar", icon: Briefcase },
    { href: "/app/offers", label: "Teklifler", short: "Teklif", icon: Handshake },
    { href: "/app/collaborations", label: "İşbirlikleri", short: "İş", icon: Wallet },
    { href: "/app/messages", label: "Mesajlar", short: "Mesaj", icon: MessageSquare, badge: true },
    { href: "/app/roster", label: "Kadro", short: "Kadro", icon: Users },
  ],
};

/** Primary bottom-tab destinations (iOS style, max 4 + More) */
const mobilePrimaryHrefs: Record<"brand" | "influencer" | "agency", string[]> = {
  brand: ["/app", "/app/discover", "/app/jobs", "/app/messages"],
  influencer: ["/app", "/app/jobs", "/app/offers", "/app/messages"],
  agency: ["/app", "/app/jobs", "/app/offers", "/app/messages"],
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

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/app" && pathname.startsWith(href));
}

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
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      className="z-40 w-60 overflow-hidden rounded-2xl border border-line bg-paper/95 shadow-[var(--shadow-md)] backdrop-blur-xl"
    >
      <div className="border-b border-line px-3.5 py-3">
        <p className="truncate text-sm font-semibold text-ink">{org}</p>
        <p className="truncate text-[11px] text-muted">
          {role} · {email}
        </p>
      </div>
      <Link
        href="/app/settings"
        onClick={onClose}
        className="flex items-center gap-2.5 px-3.5 py-3 text-sm text-ink active:bg-wash"
      >
        <span className="ios-icon-well">
          <Settings size={15} strokeWidth={1.9} />
        </span>
        Hesap ayarları
      </Link>
      <Link
        href="/app/messages"
        onClick={onClose}
        className="flex items-center gap-2.5 px-3.5 py-3 text-sm text-ink active:bg-wash"
      >
        <span className="ios-icon-well">
          <MessageSquare size={15} strokeWidth={1.9} />
        </span>
        Mesajlar
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2.5 border-t border-line px-3.5 py-3 text-sm text-rose active:bg-rose-wash"
      >
        <span className="ios-icon-well !bg-rose-wash !text-rose">
          <LogOut size={15} strokeWidth={1.9} />
        </span>
        Çıkış yap
      </button>
      <span className="sr-only">{name}</span>
    </motion.div>
  );
}

function TabIcon({
  icon: Icon,
  active,
  badge,
}: {
  icon: LucideIcon;
  active: boolean;
  badge?: number;
}) {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <span
        className={cn(
          "absolute inset-0 rounded-[9px] transition-all duration-200",
          active ? "scale-100 bg-[var(--accent-wash)]" : "scale-90 bg-transparent",
        )}
      />
      <Icon
        size={22}
        strokeWidth={active ? 2.15 : 1.7}
        className={cn(
          "relative z-10 transition-colors",
          active ? "text-[var(--accent)]" : "text-[#8e8e93]",
        )}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.14 : 0}
      />
      {badge && badge > 0 ? (
        <span className="absolute -top-0.5 -right-1 z-20 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white shadow-sm tabular">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </span>
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
  const [openMore, setOpenMore] = useState(false);
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
    setOpenMore(false);
    setOpenBell(false);
    setOpenProfile(false);
  }, [pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (
        !profileRef.current?.contains(t) &&
        !mobileProfileRef.current?.contains(t)
      ) {
        setOpenProfile(false);
      }
      if (!bellRef.current?.contains(t)) setOpenBell(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!openMore) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openMore]);

  const nav = useMemo(
    () => (user ? navByRole[user.role] : []),
    [user],
  );

  const mobileTabs = useMemo(() => {
    if (!user) return { primary: [] as NavItem[], more: [] as NavItem[] };
    const primarySet = new Set(mobilePrimaryHrefs[user.role]);
    return {
      primary: nav.filter((n) => primarySet.has(n.href)),
      more: nav.filter((n) => !primarySet.has(n.href)),
    };
  }, [nav, user]);

  const moreActive = mobileTabs.more.some((n) => isActivePath(pathname, n.href));

  if (loading || !user || user.onboardingCompleted === false) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-wash">
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
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen border-r border-line bg-paper/90 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col px-3 py-4">
          <Link href="/" className="mb-7 px-2.5">
            <Logo />
          </Link>

          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
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
                      size={18}
                      strokeWidth={active ? 2.1 : 1.7}
                      className={active ? "text-[var(--accent)]" : undefined}
                      fill={active ? "currentColor" : "none"}
                      fillOpacity={active ? 0.12 : 0}
                    />
                    {item.label}
                    {"badge" in item && item.badge && unread > 0 ? (
                      <span className="rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-white tabular">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-line pt-3">
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

      <div className="min-w-0 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Top bar — iOS compact nav */}
        <header className="ios-topbar sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 pt-[max(0.65rem,env(safe-area-inset-top))] pb-2.5 md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link href="/app" className="lg:hidden" aria-label="Rivo">
              <Logo markOnly className="[&_img]:h-8 [&_img]:w-8 [&_img]:rounded-[9px]" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-ink lg:text-sm lg:font-medium lg:text-muted">
                <span className="lg:hidden">{org}</span>
                <span className="hidden lg:inline">{roleLabel[user.role]} paneli</span>
              </p>
              <p className="truncate text-[11px] text-muted lg:hidden">
                {roleLabel[user.role]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/app/messages"
              className="ios-toolbar-btn relative"
              aria-label="Mesajlar"
            >
              <MessageSquare size={20} strokeWidth={1.85} />
              {unread > 0 ? (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-paper" />
              ) : null}
            </Link>
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setOpenBell((v) => !v)}
                className="ios-toolbar-btn relative"
                aria-label="Bildirimler"
              >
                <Bell size={20} strokeWidth={1.85} />
                {notes.length > 0 ? (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
                ) : null}
              </button>
              <AnimatePresence>
                {openBell ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper/95 shadow-[var(--shadow-md)] backdrop-blur-xl"
                  >
                    <div className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
                      Bildirimler
                    </div>
                    <div className="max-h-80 overflow-y-auto overscroll-contain">
                      {notes.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted">
                          Yeni bildirim yok.
                        </p>
                      ) : (
                        notes.map((n) => (
                          <Link
                            key={n.id}
                            href={n.href}
                            onClick={() => setOpenBell(false)}
                            className="block border-b border-line px-4 py-3 last:border-0 active:bg-wash"
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
                className="rounded-full ring-2 ring-white shadow-[var(--shadow-xs)]"
                aria-label="Profil menüsü"
              >
                <Avatar name={user.name} size={34} />
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
        </header>

        <main className="px-4 py-4 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <PageEnter key={pathname}>{children}</PageEnter>
          </AnimatePresence>
        </main>
      </div>

      {/* iOS-style bottom tab bar */}
      <nav
        className="ios-tabbar fixed inset-x-0 bottom-0 z-40 lg:hidden"
        aria-label="Ana menü"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
          {mobileTabs.primary.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="ios-tab"
                aria-current={active ? "page" : undefined}
              >
                <TabIcon
                  icon={item.icon}
                  active={active}
                  badge={item.badge ? unread : undefined}
                />
                <span
                  className={cn(
                    "mt-0.5 text-[10px] font-semibold tracking-[-0.01em]",
                    active ? "text-[var(--accent)]" : "text-[#8e8e93]",
                  )}
                >
                  {item.short ?? item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            className="ios-tab"
            onClick={() => setOpenMore(true)}
            aria-expanded={openMore}
          >
            <TabIcon icon={Ellipsis} active={moreActive || openMore} />
            <span
              className={cn(
                "mt-0.5 text-[10px] font-semibold tracking-[-0.01em]",
                moreActive || openMore ? "text-[var(--accent)]" : "text-[#8e8e93]",
              )}
            >
              Daha
            </span>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <AnimatePresence>
        {openMore ? (
          <>
            <motion.button
              type="button"
              aria-label="Kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] lg:hidden"
              onClick={() => setOpenMore(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-[22px] border border-line bg-paper shadow-[0_-12px_40px_rgba(17,17,20,0.18)] lg:hidden"
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <span className="h-1 w-10 rounded-full bg-line-strong" />
              </div>
              <div className="px-4 pb-2">
                <p className="text-[13px] font-semibold text-ink">Daha fazla</p>
                <p className="text-[11px] text-muted">Diğer araçlar ve sayfalar</p>
              </div>
              <ul className="max-h-[55dvh] overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {mobileTabs.more.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenMore(false)}
                        className={cn(
                          "mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 active:scale-[0.99]",
                          active ? "bg-[var(--accent-wash)]" : "active:bg-wash",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-[12px]",
                            active
                              ? "bg-[var(--accent)] text-white"
                              : "bg-wash-2 text-ink",
                          )}
                        >
                          <Icon
                            size={20}
                            strokeWidth={1.9}
                            fill={active ? "currentColor" : "none"}
                            fillOpacity={active ? 0.2 : 0}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-ink">
                            {item.label}
                          </span>
                        </span>
                        {item.badge && unread > 0 ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold text-white tabular">
                            {unread}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/app/settings"
                    onClick={() => setOpenMore(false)}
                    className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 active:bg-wash"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-wash-2 text-ink">
                      <Settings size={20} strokeWidth={1.9} />
                    </span>
                    <span className="text-[15px] font-semibold text-ink">
                      Ayarlar
                    </span>
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
