import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { respondJobApplication } from "@/lib/db";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { action: "accept" | "reject" };
    const result = respondJobApplication(uid, id, body.action);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
