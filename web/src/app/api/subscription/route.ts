import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setSubscription } from "@/lib/db";
import type { SubscriptionTier } from "@/lib/types";

export async function POST(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    const { tier } = (await req.json()) as { tier: SubscriptionTier };
    const user = setSubscription(uid, tier);
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
