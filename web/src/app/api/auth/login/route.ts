import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { setSessionCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }
    const user = getUserByEmail(email.trim());
    if (!user) {
      return NextResponse.json(
        { error: "Bu e-posta ile kayıtlı hesap bulunamadı." },
        { status: 404 },
      );
    }
    if (user.disabled) {
      return NextResponse.json(
        { error: "Bu hesap askıya alınmış. Destek ile iletişime geçin." },
        { status: 403 },
      );
    }
    const res = NextResponse.json({ user });
    setSessionCookies(res, user.id, user.role);
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json(
      { error: "Giriş sırasında sunucu hatası. Tekrar dene." },
      { status: 500 },
    );
  }
}
