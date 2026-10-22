import { NextResponse } from "next/server";
import { getInfluencer } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const inf = getInfluencer(id);
  if (!inf) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ influencer: inf });
}
