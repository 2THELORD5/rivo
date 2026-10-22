import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createOffer, listOffersForUser } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  return NextResponse.json({ offers: listOffersForUser(uid) });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    const body = await req.json();
    const offer = createOffer({ brandUserId: uid, ...body });
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
