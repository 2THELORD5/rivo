import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getUser,
  listCollaborationsForUser,
  listOffersForUser,
} from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const user = getUser(uid);
  if (!user) return NextResponse.json({ notifications: [] });

  const offers = listOffersForUser(uid);
  const collabs = listCollaborationsForUser(uid);
  const notes: {
    id: string;
    title: string;
    body: string;
    href: string;
    at: string;
  }[] = [];

  for (const o of offers.slice(0, 8)) {
    if (o.status === "pending" && user.role !== "brand") {
      notes.push({
        id: `off-${o.id}`,
        title: "Yeni teklif",
        body: `${o.brandName}: ${o.title}`,
        href: "/app/offers",
        at: o.createdAt,
      });
    }
    if (o.status === "countered" && user.role === "brand") {
      notes.push({
        id: `cnt-${o.id}`,
        title: "Karşı teklif",
        body: `@${o.influencerHandle} bütçe güncelledi`,
        href: "/app/offers",
        at: o.updatedAt,
      });
    }
  }

  for (const c of collabs.slice(0, 8)) {
    if (c.escrowHeld) {
      notes.push({
        id: `esc-${c.id}`,
        title: "Havuzda ödeme",
        body: `${c.title} · bekleyen tutar`,
        href: `/app/collaborations/${c.id}`,
        at: c.fundedAt || c.timeline.at(-1)?.at || new Date().toISOString(),
      });
    }
    if (c.status === "content_review" && user.role === "brand") {
      notes.push({
        id: `rev-${c.id}`,
        title: "Taslak onayı",
        body: `${c.influencerName} taslak gönderdi`,
        href: `/app/collaborations/${c.id}`,
        at: c.timeline.at(-1)?.at || new Date().toISOString(),
      });
    }
  }

  notes.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return NextResponse.json({ notifications: notes.slice(0, 12) });
}
