"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { avatarColors, initials } from "@/lib/avatar";
import { springSnappy } from "@/lib/motion";

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

const btnVariants: Record<BtnVariant, string> = {
  primary: "btn-gradient border-0",
  secondary: "bg-ink text-white hover:bg-ink-2",
  outline:
    "bg-paper text-ink border border-line-strong hover:bg-wash hover:border-ink/20",
  ghost: "bg-transparent text-slate hover:bg-wash-2 hover:text-ink",
  danger: "bg-rose-wash text-rose hover:brightness-95",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[9px] gap-1.5",
  md: "h-10 px-4 text-sm rounded-[11px] gap-2",
  lg: "h-12 px-6 text-[15px] rounded-[13px] gap-2.5",
};

export function buttonClass(
  variant: BtnVariant = "primary",
  size: BtnSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40",
    btnVariants[variant],
    btnSizes[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <motion.button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      name={props.name}
      value={props.value}
      form={props.form}
      aria-label={props["aria-label"]}
      whileHover={props.disabled ? undefined : { y: -1 }}
      whileTap={props.disabled ? undefined : { scale: 0.985 }}
      transition={springSnappy}
      className={buttonClass(variant, size, className)}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
  pulse,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warn" | "danger" | "blue" | "ink";
  className?: string;
  pulse?: boolean;
}) {
  const tones = {
    neutral: "bg-wash-2 text-slate ring-1 ring-inset ring-black/5",
    accent: "bg-accent-wash text-[var(--accent)] ring-1 ring-inset ring-rose-500/15",
    warn: "bg-amber-wash text-amber ring-1 ring-inset ring-amber-600/10",
    danger: "bg-rose-wash text-rose ring-1 ring-inset ring-rose-600/10",
    blue: "bg-blue-wash text-blue ring-1 ring-inset ring-blue-600/10",
    ink: "bg-ink text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {pulse ? (
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [fg, bg] = avatarColors(name);
  return (
    <motion.span
      whileHover={{ scale: 1.04 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-black/5",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        color: fg,
        background: bg,
      }}
      aria-hidden
    >
      {initials(name)}
    </motion.span>
  );
}

export function Card({
  children,
  className,
  padding = "md",
  interactive,
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const pads = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  const Comp = interactive ? motion.div : "div";
  const motionProps = interactive
    ? {
        whileHover: { y: -3 },
        transition: springSnappy,
      }
    : {};

  return (
    <Comp
      className={cn(
        "surface",
        interactive && "surface-hover cursor-pointer",
        pads[padding],
        className,
      )}
      {...motionProps}
    >
      {children}
    </Comp>
  );
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-[2rem] leading-[1.1] text-ink md:text-[2.35rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}

export function Stat({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="surface p-5"
    >
      <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <div className="font-display mt-3 text-[1.85rem] leading-none tracking-tight text-ink tabular">
        {value}
      </div>
      {hint ? <p className="mt-2.5 text-xs text-muted">{hint}</p> : null}
    </motion.div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon: Icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="surface px-6 py-16 text-center"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d6d]/15 to-[#7c5cff]/15 text-[#ff4d6d] ring-1 ring-black/5">
        {Icon ? <Icon size={22} strokeWidth={1.75} /> : (
          <span className="h-2 w-2 rounded-full bg-accent" />
        )}
      </div>
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-6 flex justify-center gap-2">{action}</div> : null}
    </motion.div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
        active
          ? "bg-ink text-white"
          : "border border-line bg-paper text-slate hover:border-ink/20 hover:text-ink",
      )}
    >
      {children}
      {typeof count === "number" ? (
        <span
          className={cn(
            "tabular rounded-full px-1.5 text-[10px]",
            active ? "bg-white/20" : "bg-wash-2 text-muted",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function Input({
  className,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-[12px] font-medium text-slate">{label}</span>
      ) : null}
      <input
        className={cn(
          "h-11 w-full rounded-[11px] border border-line-strong bg-paper px-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(255,77,109,0.15)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  className,
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-[12px] font-medium text-slate">{label}</span>
      ) : null}
      <textarea
        className={cn(
          "w-full rounded-[11px] border border-line-strong bg-paper px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(255,77,109,0.15)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function Logo({
  className,
  markOnly,
  invert,
}: {
  className?: string;
  markOnly?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <motion.img
        src="/rivo-mark.jpg"
        alt="Rivo"
        width={34}
        height={34}
        whileHover={{ rotate: -6, scale: 1.05 }}
        transition={springSnappy}
        className="h-[34px] w-[34px] rounded-[10px] object-cover ring-1 ring-black/5"
      />
      {!markOnly ? (
        <span
          className={cn(
            "font-display text-[1.45rem] leading-none tracking-tight",
            invert ? "text-white" : "text-ink",
          )}
        >
          Rivo
        </span>
      ) : null}
    </span>
  );
}

/** @deprecated use Reveal from motion-ui */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
