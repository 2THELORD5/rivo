import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { completeOnboarding } from "@/lib/db";

export async function POST(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    const body = await req.json();
    const user = completeOnboarding(uid, body);
    const res = NextResponse.json({ user });
    res.cookies.set("kolab_role", user.role, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
