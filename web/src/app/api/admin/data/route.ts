import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminDeleteMessage,
  adminSnapshot,
  adminUpdateCollab,
  adminUpdateOffer,
  adminUpdateUser,
  resetDb,
  addAudit,
} from "@/lib/db";

function guard(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get("rivo_admin")?.value === "1";
}

export async function GET() {
  const jar = await cookies();
  if (!guard(jar)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(adminSnapshot());
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (!guard(jar)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === "reset") {
      resetDb();
      addAudit({
        actor: "rivoadmin",
        actorType: "admin",
        action: "admin.reset",
        entity: "db",
      });
      return NextResponse.json(adminSnapshot());
    }
    if (action === "user.update") {
      adminUpdateUser(body.userId, body.patch ?? {});
      return NextResponse.json(adminSnapshot());
    }
    if (action === "offer.update") {
      adminUpdateOffer(body.offerId, body.patch ?? {});
      return NextResponse.json(adminSnapshot());
    }
    if (action === "collab.update") {
      adminUpdateCollab(body.collabId, body.patch ?? {});
      return NextResponse.json(adminSnapshot());
    }
    if (action === "message.delete") {
      adminDeleteMessage(body.messageId);
      return NextResponse.json(adminSnapshot());
    }
    return NextResponse.json({ error: "Bilinmeyen aksiyon" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
