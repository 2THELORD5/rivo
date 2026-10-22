import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ user: null });
  const user = getUser(uid);
  return NextResponse.json({ user: user ?? null });
}
