import { NextResponse } from "next/server";
import { ADMIN_CREDENTIALS } from "@/lib/types";
import { addAudit } from "@/lib/db";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; password?: string };
  if (
    body.username !== ADMIN_CREDENTIALS.username ||
    body.password !== ADMIN_CREDENTIALS.password
  ) {
    return NextResponse.json({ error: "Geçersiz yönetici bilgileri" }, { status: 401 });
  }
  addAudit({
    actor: ADMIN_CREDENTIALS.username,
    actorType: "admin",
    action: "admin.login",
    entity: "session",
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("rivo_admin", "1", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
