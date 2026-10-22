import { NextResponse } from "next/server";
import { advanceCollaboration, getCollaboration } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const c = getCollaboration(id);
  if (!c) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ collaboration: c });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const collaboration = advanceCollaboration(id, body.action, body);
    return NextResponse.json({ collaboration: getCollaboration(collaboration.id) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
