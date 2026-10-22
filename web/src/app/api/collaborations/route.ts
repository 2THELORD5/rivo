import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listCollaborationsForUser } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  return NextResponse.json({ collaborations: listCollaborationsForUser(uid) });
}
