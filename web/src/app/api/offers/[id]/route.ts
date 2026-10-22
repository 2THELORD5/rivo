import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cancelOffer, getOfferForUser, updateOffer } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await ctx.params;
  const offer = getOfferForUser(uid, id);
  if (!offer) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    if (body.action === "cancel") {
      const offer = cancelOffer(uid, id);
      return NextResponse.json({ offer });
    }
    const offer = updateOffer(uid, id, body);
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
