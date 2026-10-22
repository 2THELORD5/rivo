import { NextResponse } from "next/server";
import { ADMIN_CREDENTIALS } from "@/lib/types";
import { addAudit } from "@/lib/db";
import { setAdminCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";
    if (
      username !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json(
        { error: "Geçersiz yönetici bilgileri" },
        { status: 401 },
      );
    }
    addAudit({
      actor: ADMIN_CREDENTIALS.username,
      actorType: "admin",
      action: "admin.login",
      entity: "session",
    });
    const res = NextResponse.json({ ok: true });
    setAdminCookie(res);
    return res;
  } catch (e) {
    console.error("admin login error", e);
    return NextResponse.json(
      { error: "Yönetici girişi sırasında hata oluştu." },
      { status: 500 },
    );
  }
}
