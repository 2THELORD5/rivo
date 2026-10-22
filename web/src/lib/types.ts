export type Role = "influencer" | "brand" | "agency";

export type SubscriptionTier = "starter" | "growth" | "enterprise";

export type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "rejected"
  | "cancelled";

export type CollaborationStatus =
  | "accepted"
  | "funded"
  | "in_progress"
  | "content_review"
  | "published"
  | "disputed"
  | "paid"
  | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  brandName?: string;
  agencyName?: string;
  subscriptionTier?: SubscriptionTier | null;
  tokens?: number;
  createdAt: string;
  /** false → /onboarding */
  onboardingCompleted?: boolean;
  phone?: string;
  website?: string;
  city?: string;
  industry?: string;
  taxId?: string;
  handle?: string;
  niche?: string;
  bio?: string;
  authProvider?: "email" | "apple" | "google" | "demo";
  /** soft-disable from admin */
  disabled?: boolean;
}

export interface PlatformStat {
  name: "Instagram" | "YouTube" | "TikTok" | "Twitch";
  followers: number;
  engagement: number;
  verified: boolean;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  handle: string;
  niche: string;
  bio: string;
  city: string;
  platforms: PlatformStat[];
  minBudget: number;
  tags: string[];
  reliabilityScore: number;
  monthlyReach: number;
  agencyId?: string | null;
  pro?: boolean;
}

export interface BrandProfile {
  id: string;
  userId: string;
  company: string;
  industry: string;
  reliabilityScore: number;
  disputeRate: number;
}

export interface AgencyProfile {
  id: string;
  userId: string;
  name: string;
  influencerIds: string[];
}

export interface Offer {
  id: string;
  brandId: string;
  influencerId: string;
  agencyId?: string | null;
  title: string;
  budget: number;
  contentType: string;
  dueDate: string;
  usageRightsDays: number;
  revisions: number;
  brief: string;
  status: OfferStatus;
  tokenCost: number;
  createdAt: string;
  updatedAt: string;
  counterBudget?: number | null;
  counterNote?: string | null;
  brandNote?: string | null;
}

export interface TimelineEvent {
  at: string;
  label: string;
  by: string;
}

export interface Collaboration {
  id: string;
  offerId: string;
  brandId: string;
  influencerId: string;
  agencyId?: string | null;
  title: string;
  status: CollaborationStatus;
  amount: number;
  commission: number;
  escrowHeld: boolean;
  contractSignedAt?: string | null;
  fundedAt?: string | null;
  publishedAt?: string | null;
  verifiedAt?: string | null;
  paidAt?: string | null;
  disputeReason?: string | null;
  postUrl?: string | null;
  draftUrl?: string | null;
  timeline: TimelineEvent[];
}

export interface ChatMessage {
  id: string;
  /** offer:<id> or collab:<id> */
  threadId: string;
  offerId?: string | null;
  collaborationId?: string | null;
  fromUserId: string;
  body: string;
  createdAt: string;
  system?: boolean;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  actorType: "user" | "admin" | "system";
  action: string;
  entity: string;
  entityId?: string;
  detail?: string;
}

export interface ContractRisk {
  clause: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

export interface DbShape {
  users: User[];
  influencers: InfluencerProfile[];
  brands: BrandProfile[];
  agencies: AgencyProfile[];
  offers: Offer[];
  collaborations: Collaboration[];
  messages: ChatMessage[];
  auditLogs: AuditLog[];
}

/** Hardcoded admin console credentials (demo) */
export const ADMIN_CREDENTIALS = {
  username: "rivoadmin",
  password: "Rivo2026!",
} as const;
