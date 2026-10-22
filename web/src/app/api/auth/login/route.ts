import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
  }
  const user = getUserByEmail(email);
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
  res.cookies.set("kolab_uid", user.id, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("kolab_role", user.role, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
