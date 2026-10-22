import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type {
  AuditLog,
  ChatMessage,
  Collaboration,
  CollaborationStatus,
  ContractRisk,
  DbShape,
  Offer,
  OfferStatus,
  Role,
  SubscriptionTier,
  User,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function migrate(db: DbShape): DbShape {
  if (!Array.isArray(db.messages)) db.messages = [];
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  return db;
}

export function ensureDb(): DbShape {
  ensureDir();
  if (!existsSync(DB_PATH)) {
    const seed = createSeed();
    writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = JSON.parse(readFileSync(DB_PATH, "utf8")) as DbShape;
  const db = migrate(raw);
  if (!Array.isArray(raw.messages) || !Array.isArray(raw.auditLogs)) {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  }
  return db;
}

export function addAudit(entry: Omit<AuditLog, "id" | "at"> & { at?: string }) {
  const db = readDb();
  db.auditLogs.unshift({
    id: crypto.randomUUID(),
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor,
    actorType: entry.actorType,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    detail: entry.detail,
  });
  if (db.auditLogs.length > 500) db.auditLogs.length = 500;
  writeDb(db);
}

export function readDb(): DbShape {
  return ensureDb();
}

export function writeDb(db: DbShape) {
  ensureDir();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function resetDb() {
  const seed = createSeed();
  writeDb(seed);
  return seed;
}

export function getUserByEmail(email: string): User | undefined {
  return readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUser(id: string) {
  return readDb().users.find((u) => u.id === id);
}

export function loginOAuth(provider: "apple" | "google", role: Role = "brand") {
  const db = readDb();
  const email = `${provider}.${role}@rivo.app`;
  let user = db.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email,
      name: provider === "apple" ? "Apple Kullanıcı" : "Google Kullanıcı",
      role,
      authProvider: provider,
      onboardingCompleted: false,
      subscriptionTier: role === "brand" ? null : undefined,
      tokens: role === "brand" ? 0 : undefined,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
  }
  return user;
}

export function completeOnboarding(
  userId: string,
  payload: {
    role: Role;
    name: string;
    brandName?: string;
    agencyName?: string;
    phone?: string;
    website?: string;
    city?: string;
    industry?: string;
    taxId?: string;
    handle?: string;
    niche?: string;
    bio?: string;
    minBudget?: number;
  },
) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Kullanıcı bulunamadı");

  user.role = payload.role;
  user.name = payload.name;
  user.phone = payload.phone;
  user.website = payload.website;
  user.city = payload.city;
  user.industry = payload.industry;
  user.taxId = payload.taxId;
  user.handle = payload.handle;
  user.niche = payload.niche;
  user.bio = payload.bio;
  user.onboardingCompleted = true;

  if (payload.role === "brand") {
    user.brandName = payload.brandName || payload.name;
    user.subscriptionTier = user.subscriptionTier ?? "starter";
    user.tokens = user.tokens && user.tokens > 0 ? user.tokens : 20;
    let brand = db.brands.find((b) => b.userId === userId);
    if (!brand) {
      brand = {
        id: crypto.randomUUID(),
        userId,
        company: user.brandName!,
        industry: payload.industry || "Genel",
        reliabilityScore: 80,
        disputeRate: 0.05,
      };
      db.brands.push(brand);
    } else {
      brand.company = user.brandName!;
      brand.industry = payload.industry || brand.industry;
    }
  }

  if (payload.role === "influencer") {
    let inf = db.influencers.find((i) => i.userId === userId);
    if (!inf) {
      inf = {
        id: crypto.randomUUID(),
        userId,
        handle: (payload.handle || payload.name).replace(/\s+/g, "").toLowerCase(),
        niche: payload.niche || "Lifestyle",
        bio: payload.bio || "",
        city: payload.city || "İstanbul",
        platforms: [
          {
            name: "Instagram",
            followers: 10000,
            engagement: 3.5,
            verified: false,
          },
        ],
        minBudget: payload.minBudget || 5000,
        tags: [payload.niche || "lifestyle"],
        reliabilityScore: 85,
        monthlyReach: 50000,
        agencyId: null,
      };
      db.influencers.push(inf);
    } else {
      inf.handle = payload.handle || inf.handle;
      inf.niche = payload.niche || inf.niche;
      inf.bio = payload.bio || inf.bio;
      inf.city = payload.city || inf.city;
      if (payload.minBudget) inf.minBudget = payload.minBudget;
    }
  }

  if (payload.role === "agency") {
    user.agencyName = payload.agencyName || payload.name;
    let agency = db.agencies.find((a) => a.userId === userId);
    if (!agency) {
      agency = {
        id: crypto.randomUUID(),
        userId,
        name: user.agencyName!,
        influencerIds: [],
      };
      db.agencies.push(agency);
    } else {
      agency.name = user.agencyName!;
    }
  }

  writeDb(db);
  return user;
}

export function listInfluencers(filters?: {
  niche?: string;
  q?: string;
  minFollowers?: number;
}) {
  const db = readDb();
  return db.influencers
    .map((inf) => {
      const user = db.users.find((u) => u.id === inf.userId)!;
      const agency = inf.agencyId
        ? db.agencies.find((a) => a.id === inf.agencyId)
        : null;
      return { ...inf, name: user.name, email: user.email, agencyName: agency?.name };
    })
    .filter((inf) => {
      if (filters?.niche && filters.niche !== "Tümü" && inf.niche !== filters.niche)
        return false;
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        if (
          !inf.handle.includes(q) &&
          !inf.name.toLowerCase().includes(q) &&
          !inf.tags.some((t) => t.includes(q))
        )
          return false;
      }
      if (filters?.minFollowers) {
        const max = Math.max(...inf.platforms.map((p) => p.followers));
        if (max < filters.minFollowers) return false;
      }
      return true;
    });
}

export function getInfluencer(id: string) {
  const db = readDb();
  const inf = db.influencers.find((i) => i.id === id);
  if (!inf) return null;
  const user = db.users.find((u) => u.id === inf.userId)!;
  return { ...inf, name: user.name, email: user.email };
}

export function getBrandByUser(userId: string) {
  return readDb().brands.find((b) => b.userId === userId);
}

export function getInfluencerByUser(userId: string) {
  return readDb().influencers.find((i) => i.userId === userId);
}

export function getAgencyByUser(userId: string) {
  return readDb().agencies.find((a) => a.userId === userId);
}

export function setSubscription(userId: string, tier: SubscriptionTier) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.role !== "brand") throw new Error("Sadece markalar abone olabilir");
  user.subscriptionTier = tier;
  const tokens = tier === "starter" ? 20 : tier === "growth" ? 60 : 200;
  user.tokens = (user.tokens ?? 0) + tokens;
  writeDb(db);
  return user;
}

export function createOffer(input: {
  brandUserId: string;
  influencerId: string;
  title: string;
  budget: number;
  contentType: string;
  dueDate: string;
  usageRightsDays: number;
  revisions: number;
  brief: string;
}) {
  const db = readDb();
  const brandUser = db.users.find((u) => u.id === input.brandUserId);
  const brand = db.brands.find((b) => b.userId === input.brandUserId);
  if (!brandUser || !brand) throw new Error("Marka bulunamadı");
  if (!brandUser.subscriptionTier)
    throw new Error("Abonelik olmadan teklif gönderilemez");
  if ((brandUser.tokens ?? 0) < 150)
    throw new Error("Yetersiz teklif jetonu (150 TL jeton gerekir)");
  const inf = db.influencers.find((i) => i.id === input.influencerId);
  if (!inf) throw new Error("Influencer bulunamadı");
  if (input.budget < inf.minBudget)
    throw new Error(`Minimum bütçe ${inf.minBudget} TL`);

  brandUser.tokens = (brandUser.tokens ?? 0) - 150;
  const offer: Offer = {
    id: crypto.randomUUID(),
    brandId: brand.id,
    influencerId: inf.id,
    agencyId: inf.agencyId ?? null,
    title: input.title,
    budget: input.budget,
    contentType: input.contentType,
    dueDate: input.dueDate,
    usageRightsDays: input.usageRightsDays,
    revisions: input.revisions,
    brief: input.brief,
    status: "pending",
    tokenCost: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.offers.unshift(offer);
  db.messages.push({
    id: crypto.randomUUID(),
    threadId: `offer:${offer.id}`,
    offerId: offer.id,
    fromUserId: input.brandUserId,
    body: `Teklif oluşturuldu: ${offer.title} · ${offer.budget.toLocaleString("tr-TR")} TL`,
    createdAt: new Date().toISOString(),
    system: true,
  });
  writeDb(db);
  addAudit({
    actor: brandUser.email,
    actorType: "user",
    action: "offer.create",
    entity: "offer",
    entityId: offer.id,
    detail: offer.title,
  });
  return offer;
}

export function updateOffer(
  brandUserId: string,
  offerId: string,
  patch: Partial<
    Pick<
      Offer,
      | "title"
      | "budget"
      | "contentType"
      | "dueDate"
      | "usageRightsDays"
      | "revisions"
      | "brief"
      | "brandNote"
    >
  >,
) {
  const db = readDb();
  const brand = db.brands.find((b) => b.userId === brandUserId);
  const offer = db.offers.find((o) => o.id === offerId);
  if (!brand || !offer) throw new Error("Teklif bulunamadı");
  if (offer.brandId !== brand.id) throw new Error("Yetkisiz");
  if (offer.status !== "pending" && offer.status !== "countered")
    throw new Error("Sadece bekleyen teklifler düzenlenebilir");
  const inf = db.influencers.find((i) => i.id === offer.influencerId)!;
  if (patch.budget != null && patch.budget < inf.minBudget)
    throw new Error(`Minimum bütçe ${inf.minBudget} TL`);
  Object.assign(offer, patch, { updatedAt: new Date().toISOString() });
  if (offer.status === "countered" && patch.budget != null) {
    offer.status = "pending";
    offer.counterBudget = null;
    offer.counterNote = null;
  }
  db.messages.push({
    id: crypto.randomUUID(),
    threadId: `offer:${offer.id}`,
    offerId: offer.id,
    fromUserId: brandUserId,
    body: "Marka teklifi güncelledi.",
    createdAt: new Date().toISOString(),
    system: true,
  });
  writeDb(db);
  const user = db.users.find((u) => u.id === brandUserId)!;
  addAudit({
    actor: user.email,
    actorType: "user",
    action: "offer.update",
    entity: "offer",
    entityId: offer.id,
    detail: offer.title,
  });
  return enrichOffer(readDb(), offer);
}

export function cancelOffer(brandUserId: string, offerId: string) {
  const db = readDb();
  const brand = db.brands.find((b) => b.userId === brandUserId);
  const offer = db.offers.find((o) => o.id === offerId);
  if (!brand || !offer) throw new Error("Teklif bulunamadı");
  if (offer.brandId !== brand.id) throw new Error("Yetkisiz");
  if (!["pending", "countered"].includes(offer.status))
    throw new Error("Bu teklif iptal edilemez");
  offer.status = "cancelled";
  offer.updatedAt = new Date().toISOString();
  writeDb(db);
  const user = db.users.find((u) => u.id === brandUserId)!;
  addAudit({
    actor: user.email,
    actorType: "user",
    action: "offer.cancel",
    entity: "offer",
    entityId: offer.id,
    detail: offer.title,
  });
  return enrichOffer(readDb(), offer);
}

export function respondOffer(
  offerId: string,
  action: "accept" | "reject" | "counter",
  counterBudget?: number,
  opts?: { userId?: string; counterNote?: string },
) {
  const db = readDb();
  const offer = db.offers.find((o) => o.id === offerId);
  if (!offer) throw new Error("Teklif bulunamadı");
  if (offer.status !== "pending" && offer.status !== "countered")
    throw new Error("Bu teklif güncellenemez");

  const actorUser = opts?.userId
    ? db.users.find((u) => u.id === opts.userId)
    : undefined;

  if (action === "reject") {
    offer.status = "rejected";
    offer.updatedAt = new Date().toISOString();
    writeDb(db);
    if (actorUser) {
      addAudit({
        actor: actorUser.email,
        actorType: "user",
        action: "offer.reject",
        entity: "offer",
        entityId: offer.id,
      });
    }
    return { offer: enrichOffer(readDb(), offer), collaboration: null };
  }

  if (action === "counter") {
    if (!counterBudget) throw new Error("Karşı teklif bütçesi gerekli");
    offer.status = "countered";
    offer.counterBudget = counterBudget;
    offer.counterNote = opts?.counterNote ?? null;
    offer.updatedAt = new Date().toISOString();
    if (opts?.userId) {
      db.messages.push({
        id: crypto.randomUUID(),
        threadId: `offer:${offer.id}`,
        offerId: offer.id,
        fromUserId: opts.userId,
        body: opts.counterNote
          ? `Karşı teklif: ${counterBudget.toLocaleString("tr-TR")} TL — ${opts.counterNote}`
          : `Karşı teklif: ${counterBudget.toLocaleString("tr-TR")} TL`,
        createdAt: new Date().toISOString(),
      });
    }
    writeDb(db);
    if (actorUser) {
      addAudit({
        actor: actorUser.email,
        actorType: "user",
        action: "offer.counter",
        entity: "offer",
        entityId: offer.id,
        detail: String(counterBudget),
      });
    }
    return { offer: enrichOffer(readDb(), offer), collaboration: null };
  }

  const amount =
    offer.counterBudget && offer.status === "countered"
      ? offer.counterBudget
      : offer.budget;
  offer.status = "accepted" as OfferStatus;
  offer.budget = amount;
  offer.updatedAt = new Date().toISOString();

  const collab: Collaboration = {
    id: crypto.randomUUID(),
    offerId: offer.id,
    brandId: offer.brandId,
    influencerId: offer.influencerId,
    agencyId: offer.agencyId,
    title: offer.title,
    status: "accepted",
    amount,
    commission: Math.round(amount * 0.1),
    escrowHeld: false,
    contractSignedAt: new Date().toISOString(),
    timeline: [
      {
        at: offer.createdAt,
        label: "Teklif gönderildi",
        by: "Marka",
      },
      {
        at: new Date().toISOString(),
        label: "Teklif kabul edildi · dijital sözleşme onaylandı",
        by: "Influencer",
      },
    ],
  };
  db.collaborations.unshift(collab);
  // migrate offer thread messages to also link collab
  for (const m of db.messages) {
    if (m.offerId === offer.id) m.collaborationId = collab.id;
  }
  db.messages.push({
    id: crypto.randomUUID(),
    threadId: `collab:${collab.id}`,
    offerId: offer.id,
    collaborationId: collab.id,
    fromUserId: opts?.userId ?? "system",
    body: "İşbirliği başladı. Bu sohbet üzerinden teslim ve onayları konuşabilirsiniz.",
    createdAt: new Date().toISOString(),
    system: true,
  });
  writeDb(db);
  if (actorUser) {
    addAudit({
      actor: actorUser.email,
      actorType: "user",
      action: "offer.accept",
      entity: "collaboration",
      entityId: collab.id,
      detail: offer.title,
    });
  }
  return {
    offer: enrichOffer(readDb(), offer),
    collaboration: enrichCollab(readDb(), collab),
  };
}

function appendTimeline(c: Collaboration, label: string, by: string) {
  c.timeline.push({ at: new Date().toISOString(), label, by });
}

export function advanceCollaboration(
  id: string,
  action:
    | "fund"
    | "start_content"
    | "submit_draft"
    | "approve_draft"
    | "publish"
    | "verify"
    | "release"
    | "dispute"
    | "cancel",
  meta?: { url?: string; reason?: string; by?: string },
) {
  const db = readDb();
  const c = db.collaborations.find((x) => x.id === id);
  if (!c) throw new Error("İşbirliği bulunamadı");
  const by = meta?.by ?? "Sistem";

  const set = (status: CollaborationStatus, label: string, extra?: () => void) => {
    c.status = status;
    appendTimeline(c, label, by);
    extra?.();
  };

  switch (action) {
    case "fund":
      if (c.status !== "accepted") throw new Error("Önce sözleşme gerekli");
      set("funded", `${c.amount.toLocaleString("tr-TR")} TL ödeme havuzuna alındı`, () => {
        c.escrowHeld = true;
        c.fundedAt = new Date().toISOString();
      });
      break;
    case "start_content":
      if (c.status !== "funded") throw new Error("Önce ödeme havuza alınmalı");
      set("in_progress", "İçerik üretimi başladı");
      break;
    case "submit_draft":
      if (c.status !== "in_progress" && c.status !== "funded")
        throw new Error("İçerik aşamasında değil");
      set("content_review", "Taslak markaya gönderildi", () => {
        c.draftUrl = meta?.url ?? "https://drive.example/taslak";
      });
      break;
    case "approve_draft":
      if (c.status !== "content_review") throw new Error("Onay bekleyen taslak yok");
      set("in_progress", "Marka taslağı onayladı · yayınlanabilir");
      break;
    case "publish":
      if (!["in_progress", "content_review", "funded"].includes(c.status))
        throw new Error("Yayınlanacak aşamada değil");
      set("published", "İçerik yayınlandı · doğrulama bekleniyor", () => {
        c.postUrl = meta?.url ?? "https://instagram.com/p/demo";
        c.publishedAt = new Date().toISOString();
      });
      break;
    case "verify":
      if (c.status !== "published") throw new Error("Yayın bekleniyor");
      set("published", "Yayın API ile doğrulandı · #işbirliği etiketi mevcut", () => {
        c.verifiedAt = new Date().toISOString();
      });
      break;
    case "release":
      if (c.status !== "published" || !c.verifiedAt)
        throw new Error("Doğrulama sonrası ödeme serbest bırakılır");
      set("paid", "Ödeme influencer banka hesabına aktarıldı", () => {
        c.escrowHeld = false;
        c.paidAt = new Date().toISOString();
      });
      break;
    case "dispute":
      set("disputed", `İtiraz açıldı: ${meta?.reason ?? "Brief uyumsuzluğu"}`, () => {
        c.disputeReason = meta?.reason ?? "Brief uyumsuzluğu";
      });
      break;
    case "cancel":
      set("cancelled", "İşbirliği iptal edildi · havuz iade kuralına göre işlendi", () => {
        c.escrowHeld = false;
      });
      break;
  }

  writeDb(db);
  return c;
}

export function acceptCounter(offerId: string, userId?: string) {
  const db = readDb();
  const offer = db.offers.find((o) => o.id === offerId);
  if (!offer || offer.status !== "countered" || !offer.counterBudget)
    throw new Error("Karşı teklif yok");
  offer.budget = offer.counterBudget;
  writeDb(db);
  return respondOffer(offerId, "accept", undefined, { userId });
}

export function listOffersForUser(userId: string) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];

  let offers = db.offers;
  if (user.role === "brand") {
    const brand = db.brands.find((b) => b.userId === userId);
    offers = offers.filter((o) => o.brandId === brand?.id);
  } else if (user.role === "influencer") {
    const inf = db.influencers.find((i) => i.userId === userId);
    offers = offers.filter((o) => o.influencerId === inf?.id);
  } else if (user.role === "agency") {
    const agency = db.agencies.find((a) => a.userId === userId);
    offers = offers.filter((o) => o.agencyId === agency?.id);
  }

  return offers.map((o) => enrichOffer(db, o));
}

export function listCollaborationsForUser(userId: string) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];

  let list = db.collaborations;
  if (user.role === "brand") {
    const brand = db.brands.find((b) => b.userId === userId);
    list = list.filter((c) => c.brandId === brand?.id);
  } else if (user.role === "influencer") {
    const inf = db.influencers.find((i) => i.userId === userId);
    list = list.filter((c) => c.influencerId === inf?.id);
  } else if (user.role === "agency") {
    const agency = db.agencies.find((a) => a.userId === userId);
    list = list.filter((c) => c.agencyId === agency?.id);
  }

  return list.map((c) => enrichCollab(db, c));
}

export function getCollaboration(id: string) {
  const db = readDb();
  const c = db.collaborations.find((x) => x.id === id);
  if (!c) return null;
  return enrichCollab(db, c);
}

function enrichOffer(db: DbShape, o: Offer) {
  const brand = db.brands.find((b) => b.id === o.brandId);
  const inf = db.influencers.find((i) => i.id === o.influencerId);
  const infUser = db.users.find((u) => u.id === inf?.userId);
  const collab = db.collaborations.find((c) => c.offerId === o.id);
  return {
    ...o,
    brandName: brand?.company ?? "",
    influencerName: infUser?.name ?? "",
    influencerHandle: inf?.handle ?? "",
    collaborationId: collab?.id ?? null,
  };
}

function enrichCollab(db: DbShape, c: Collaboration) {
  const brand = db.brands.find((b) => b.id === c.brandId);
  const inf = db.influencers.find((i) => i.id === c.influencerId);
  const infUser = db.users.find((u) => u.id === inf?.userId);
  const agency = c.agencyId ? db.agencies.find((a) => a.id === c.agencyId) : null;
  return {
    ...c,
    brandName: brand?.company ?? "",
    brandScore: brand?.reliabilityScore ?? 0,
    influencerName: infUser?.name ?? "",
    influencerHandle: inf?.handle ?? "",
    agencyName: agency?.name ?? null,
  };
}

export function agencyDashboard(userId: string) {
  const db = readDb();
  const agency = db.agencies.find((a) => a.userId === userId);
  if (!agency) throw new Error("Ajans bulunamadı");
  const influencers = listInfluencers().filter((i) =>
    agency.influencerIds.includes(i.id),
  );
  const collabs = db.collaborations
    .filter((c) => c.agencyId === agency.id)
    .map((c) => enrichCollab(db, c));
  const offers = db.offers
    .filter((o) => o.agencyId === agency.id)
    .map((o) => enrichOffer(db, o));
  const volume = collabs.reduce((s, c) => s + c.amount, 0);
  const pendingPay = collabs.filter((c) => c.escrowHeld).length;
  return { agency, influencers, collabs, offers, volume, pendingPay };
}

export function scanContract(text: string): ContractRisk[] {
  const risks: ContractRisk[] = [];
  const lower = text.toLowerCase();
  const checks: Array<[RegExp | string, ContractRisk]> = [
    [
      /süresiz|unlimited|kalıcı hak/i,
      {
        clause: "Süresiz kullanım hakkı",
        severity: "high",
        explanation:
          "İçeriğin süresiz kullanımına izin veren madde. Süre sınırı (ör. 90 gün) pazarlık edilebilir.",
      },
    ],
    [
      /münhasır|exclusiv/i,
      {
        clause: "Münhasırlık",
        severity: "high",
        explanation:
          "Belirli bir süre rakip markalarla çalışmayı engelleyebilir. Kapsamı ve süreyi netleştirin.",
      },
    ],
    [
      /cezai şart|penalty|tazminat/i,
      {
        clause: "Cezai şart",
        severity: "medium",
        explanation:
          "Gecikme veya brief sapması için yüksek ceza yazılmış olabilir. Oranı makul tutun.",
      },
    ],
    [
      /değişiklik yapma|edit hakkı|düzenleme hakkı/i,
      {
        clause: "İçerik üzerinde sınırsız düzenleme",
        severity: "medium",
        explanation:
          "Markanın içeriği serbestçe değiştirmesi itibar riski yaratabilir. Onay şartı ekleyin.",
      },
    ],
    [
      /ödeme.*sonra|teslim.*sonra ödeme|net 60|net 90/i,
      {
        clause: "Gecikmeli ödeme",
        severity: "high",
        explanation:
          "Ödeme teslimden sonraya bırakılmış. Rivo'da ödeme baştan havuza alınır.",
      },
    ],
  ];

  for (const [pat, risk] of checks) {
    if (typeof pat === "string" ? lower.includes(pat) : pat.test(text)) {
      risks.push(risk);
    }
  }

  if (risks.length === 0) {
    risks.push({
      clause: "Belirgin yüksek risk bulunamadı",
      severity: "low",
      explanation:
        "Bu bilgilendirme hukuki görüş değildir. Şüphede bir avukata danışın.",
    });
  } else {
    risks.push({
      clause: "Uyarı",
      severity: "low",
      explanation:
        "Yapay zeka tarayıcı hukuki görüş vermez; riskli maddeleri işaretler. Gerekirse avukata başvurun.",
    });
  }
  return risks;
}

export function dashboardStats(userId: string) {
  const user = getUser(userId);
  if (!user) throw new Error("Kullanıcı yok");
  const offers = listOffersForUser(userId);
  const collabs = listCollaborationsForUser(userId);
  const active = collabs.filter((c) => !["paid", "cancelled"].includes(c.status));
  const paid = collabs.filter((c) => c.status === "paid");
  const volume = paid.reduce((s, c) => s + c.amount, 0);
  const escrow = collabs.filter((c) => c.escrowHeld).reduce((s, c) => s + c.amount, 0);

  const activity: {
    id: string;
    title: string;
    body: string;
    href: string;
    at: string;
  }[] = [];

  for (const o of offers.slice(0, 10)) {
    activity.push({
      id: `offer-${o.id}`,
      title:
        o.status === "pending"
          ? "Bekleyen teklif"
          : o.status === "countered"
            ? "Karşı teklif"
            : o.status === "accepted"
              ? "Teklif kabul"
              : `Teklif · ${o.status}`,
      body: `${o.brandName} → @${o.influencerHandle} · ${o.title}`,
      href: "/app/offers",
      at: o.updatedAt || o.createdAt,
    });
  }

  for (const c of collabs.slice(0, 10)) {
    const last = c.timeline.at(-1);
    activity.push({
      id: `collab-${c.id}-${last?.at ?? c.id}`,
      title: last?.label ?? c.title,
      body: `${c.brandName} · @${c.influencerHandle}`,
      href: `/app/collaborations/${c.id}`,
      at: last?.at ?? new Date().toISOString(),
    });
  }

  activity.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return {
    user,
    offersPending: offers.filter((o) => o.status === "pending" || o.status === "countered")
      .length,
    activeCollabs: active.length,
    paidCount: paid.length,
    volume,
    escrow,
    tokens: user.tokens ?? 0,
    subscriptionTier: user.subscriptionTier ?? null,
    activity: activity.slice(0, 8),
  };
}

function userCanAccessOffer(userId: string, offer: Offer) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.disabled) return false;
  if (user.role === "brand") {
    const brand = db.brands.find((b) => b.userId === userId);
    return brand?.id === offer.brandId;
  }
  if (user.role === "influencer") {
    const inf = db.influencers.find((i) => i.userId === userId);
    return inf?.id === offer.influencerId;
  }
  if (user.role === "agency") {
    const agency = db.agencies.find((a) => a.userId === userId);
    return agency?.id === offer.agencyId;
  }
  return false;
}

function userCanAccessCollab(userId: string, c: Collaboration) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.disabled) return false;
  if (user.role === "brand") {
    const brand = db.brands.find((b) => b.userId === userId);
    return brand?.id === c.brandId;
  }
  if (user.role === "influencer") {
    const inf = db.influencers.find((i) => i.userId === userId);
    return inf?.id === c.influencerId;
  }
  if (user.role === "agency") {
    const agency = db.agencies.find((a) => a.userId === userId);
    return agency?.id === c.agencyId;
  }
  return false;
}

function threadMessages(db: DbShape, threadId: string) {
  const [kind, id] = threadId.split(":");
  return db.messages.filter((m) => {
    if (m.threadId === threadId) return true;
    if (kind === "offer" && m.offerId === id) return true;
    if (kind === "collab" && m.collaborationId === id) return true;
    // also pull offer msgs into collab thread
    if (kind === "collab") {
      const c = db.collaborations.find((x) => x.id === id);
      if (c && m.offerId === c.offerId) return true;
    }
    return false;
  });
}

function unreadInThread(db: DbShape, userId: string, threadId: string) {
  return threadMessages(db, threadId).filter(
    (m) =>
      !m.system &&
      m.fromUserId !== userId &&
      !(m.readBy ?? []).includes(userId),
  ).length;
}

export function listThreadsForUser(userId: string) {
  const db = readDb();
  const offers = listOffersForUser(userId);
  const collabs = listCollaborationsForUser(userId);
  const acceptedOfferIds = new Set(collabs.map((c) => c.offerId));

  const threads: {
    threadId: string;
    title: string;
    subtitle: string;
    href: string;
    entityHref: string;
    lastMessage?: string;
    lastAt: string;
    kind: "offer" | "collab";
    unread: number;
  }[] = [];

  for (const o of offers) {
    if (acceptedOfferIds.has(o.id)) continue; // collab thread is canonical
    const threadId = `offer:${o.id}`;
    const msgs = threadMessages(db, threadId).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    const last = msgs[0];
    threads.push({
      threadId,
      title: o.title,
      subtitle: `${o.brandName} ↔ @${o.influencerHandle}`,
      href: `/app/messages?thread=${encodeURIComponent(threadId)}`,
      entityHref: `/app/offers/${o.id}`,
      lastMessage: last?.body,
      lastAt: last?.createdAt ?? o.updatedAt,
      kind: "offer",
      unread: unreadInThread(db, userId, threadId),
    });
  }

  for (const c of collabs) {
    const threadId = `collab:${c.id}`;
    const msgs = threadMessages(db, threadId).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    const last = msgs[0];
    threads.push({
      threadId,
      title: c.title,
      subtitle: `${c.brandName} · işbirliği · @${c.influencerHandle}`,
      href: `/app/messages?thread=${encodeURIComponent(threadId)}`,
      entityHref: `/app/collaborations/${c.id}`,
      lastMessage: last?.body,
      lastAt: last?.createdAt ?? c.timeline.at(-1)?.at ?? new Date().toISOString(),
      kind: "collab",
      unread: unreadInThread(db, userId, threadId),
    });
  }

  threads.sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt));
  return threads;
}

export function unreadMessageCount(userId: string) {
  return listThreadsForUser(userId).reduce((s, t) => s + t.unread, 0);
}

export function markThreadRead(userId: string, threadId: string) {
  const db = readDb();
  let changed = false;
  for (const m of threadMessages(db, threadId)) {
    if (m.system || m.fromUserId === userId) continue;
    const readBy = m.readBy ?? [];
    if (!readBy.includes(userId)) {
      m.readBy = [...readBy, userId];
      changed = true;
    }
  }
  if (changed) writeDb(db);
  return { ok: true };
}

export function listMessagesForThread(userId: string, threadId: string) {
  const db = readDb();
  const [kind, id] = threadId.split(":");
  if (kind === "offer") {
    const offer = db.offers.find((o) => o.id === id);
    if (!offer || !userCanAccessOffer(userId, offer))
      throw new Error("Sohbete erişim yok");
  } else if (kind === "collab") {
    const c = db.collaborations.find((x) => x.id === id);
    if (!c || !userCanAccessCollab(userId, c))
      throw new Error("Sohbete erişim yok");
  } else {
    throw new Error("Geçersiz sohbet");
  }

  const messages = db.messages
    .filter((m) => {
      if (m.threadId === threadId) return true;
      if (kind === "offer" && m.offerId === id) return true;
      if (kind === "collab" && m.collaborationId === id) return true;
      return false;
    })
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .map((m) => {
      const from = db.users.find((u) => u.id === m.fromUserId);
      return {
        ...m,
        fromName: m.system ? "Sistem" : from?.name ?? "Kullanıcı",
        fromRole: from?.role,
      };
    });

  return messages;
}

export function sendMessage(
  userId: string,
  input: { threadId: string; body: string },
) {
  const body = input.body.trim();
  if (!body) throw new Error("Mesaj boş olamaz");
  if (body.length > 2000) throw new Error("Mesaj çok uzun");

  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.disabled) throw new Error("Yetkisiz");

  const [kind, id] = input.threadId.split(":");
  let offerId: string | null = null;
  let collaborationId: string | null = null;

  if (kind === "offer") {
    const offer = db.offers.find((o) => o.id === id);
    if (!offer || !userCanAccessOffer(userId, offer))
      throw new Error("Sohbete erişim yok");
    offerId = offer.id;
    const collab = db.collaborations.find((c) => c.offerId === offer.id);
    collaborationId = collab?.id ?? null;
  } else if (kind === "collab") {
    const c = db.collaborations.find((x) => x.id === id);
    if (!c || !userCanAccessCollab(userId, c))
      throw new Error("Sohbete erişim yok");
    collaborationId = c.id;
    offerId = c.offerId;
  } else {
    throw new Error("Geçersiz sohbet");
  }

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    threadId: input.threadId,
    offerId,
    collaborationId,
    fromUserId: userId,
    body,
    createdAt: new Date().toISOString(),
  };
  db.messages.push(msg);
  writeDb(db);
  addAudit({
    actor: user.email,
    actorType: "user",
    action: "chat.send",
    entity: "message",
    entityId: msg.id,
    detail: input.threadId,
  });
  return {
    ...msg,
    fromName: user.name,
    fromRole: user.role,
  };
}

export function getOfferForUser(userId: string, offerId: string) {
  const db = readDb();
  const offer = db.offers.find((o) => o.id === offerId);
  if (!offer || !userCanAccessOffer(userId, offer)) return null;
  return enrichOffer(db, offer);
}

export function adminSnapshot() {
  const db = readDb();
  return {
    counts: {
      users: db.users.length,
      brands: db.brands.length,
      influencers: db.influencers.length,
      agencies: db.agencies.length,
      offers: db.offers.length,
      collaborations: db.collaborations.length,
      messages: db.messages.length,
      auditLogs: db.auditLogs.length,
    },
    users: db.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      disabled: !!u.disabled,
      tokens: u.tokens ?? null,
      subscriptionTier: u.subscriptionTier ?? null,
      createdAt: u.createdAt,
    })),
    offers: db.offers.map((o) => enrichOffer(db, o)),
    collaborations: db.collaborations.map((c) => enrichCollab(db, c)),
    messages: [...db.messages]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 80)
      .map((m) => ({
        ...m,
        fromName: db.users.find((u) => u.id === m.fromUserId)?.name ?? "—",
      })),
    auditLogs: db.auditLogs.slice(0, 120),
  };
}

export function adminUpdateUser(
  userId: string,
  patch: { disabled?: boolean; tokens?: number; subscriptionTier?: SubscriptionTier | null },
) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Kullanıcı yok");
  if (patch.disabled != null) user.disabled = patch.disabled;
  if (patch.tokens != null) user.tokens = patch.tokens;
  if (patch.subscriptionTier !== undefined)
    user.subscriptionTier = patch.subscriptionTier;
  writeDb(db);
  addAudit({
    actor: "rivoadmin",
    actorType: "admin",
    action: "admin.user.update",
    entity: "user",
    entityId: userId,
    detail: JSON.stringify(patch),
  });
  return user;
}

export function adminUpdateOffer(
  offerId: string,
  patch: Partial<Pick<Offer, "status" | "budget" | "title" | "brief">>,
) {
  const db = readDb();
  const offer = db.offers.find((o) => o.id === offerId);
  if (!offer) throw new Error("Teklif yok");
  Object.assign(offer, patch, { updatedAt: new Date().toISOString() });
  writeDb(db);
  addAudit({
    actor: "rivoadmin",
    actorType: "admin",
    action: "admin.offer.update",
    entity: "offer",
    entityId: offerId,
    detail: JSON.stringify(patch),
  });
  return enrichOffer(readDb(), offer);
}

export function adminUpdateCollab(
  collabId: string,
  patch: Partial<
    Pick<Collaboration, "status" | "amount" | "escrowHeld" | "disputeReason">
  >,
) {
  const db = readDb();
  const c = db.collaborations.find((x) => x.id === collabId);
  if (!c) throw new Error("İşbirliği yok");
  Object.assign(c, patch);
  appendTimeline(c, `Admin güncelleme: ${JSON.stringify(patch)}`, "Admin");
  writeDb(db);
  addAudit({
    actor: "rivoadmin",
    actorType: "admin",
    action: "admin.collab.update",
    entity: "collaboration",
    entityId: collabId,
    detail: JSON.stringify(patch),
  });
  return enrichCollab(readDb(), c);
}

export function adminDeleteMessage(messageId: string) {
  const db = readDb();
  const before = db.messages.length;
  db.messages = db.messages.filter((m) => m.id !== messageId);
  if (db.messages.length === before) throw new Error("Mesaj yok");
  writeDb(db);
  addAudit({
    actor: "rivoadmin",
    actorType: "admin",
    action: "admin.message.delete",
    entity: "message",
    entityId: messageId,
  });
}
