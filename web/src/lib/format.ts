import type { CollaborationStatus, OfferStatus } from "./types";

export function formatTL(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const offerLabels: Record<OfferStatus, string> = {
  pending: "Beklemede",
  countered: "Karşı teklif",
  accepted: "Kabul edildi",
  rejected: "Reddedildi",
  cancelled: "İptal",
};

const collabLabels: Record<CollaborationStatus, string> = {
  accepted: "Sözleşme hazır",
  funded: "Ödeme havuzunda",
  in_progress: "İçerik üretiliyor",
  content_review: "Marka onayı",
  published: "Yayın doğrulandı",
  disputed: "İtiraz",
  paid: "Ödendi",
  cancelled: "İptal",
};

export function offerStatusLabel(s: OfferStatus) {
  return offerLabels[s];
}

export function collabStatusLabel(s: CollaborationStatus) {
  return collabLabels[s];
}

export function tierLabel(tier: string | null | undefined) {
  if (tier === "starter") return "Başlangıç · 2.999 TL";
  if (tier === "growth") return "Büyüme · 9.999 TL";
  if (tier === "enterprise") return "Kurumsal · 29.999 TL";
  return "Abonelik yok";
}
