import { NextResponse } from "next/server";
import { loginOAuth } from "@/lib/db";
import { setSessionCookies } from "@/lib/cookies";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      provider?: "apple" | "google";
      role?: Role;
    };
    if (!body.provider) {
      return NextResponse.json({ error: "Provider gerekli" }, { status: 400 });
    }
    const user = loginOAuth(body.provider, body.role ?? "brand");
    const res = NextResponse.json({ user });
    setSessionCookies(res, user.id, user.role);
    return res;
  } catch (e) {
    console.error("oauth error", e);
    return NextResponse.json(
      { error: "OAuth girişi başarısız. Tekrar dene." },
      { status: 500 },
    );
  }
}
