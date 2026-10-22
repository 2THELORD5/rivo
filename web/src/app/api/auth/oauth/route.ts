import { NextResponse } from "next/server";
import { loginOAuth } from "@/lib/db";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    provider?: "apple" | "google";
    role?: Role;
  };
  if (!body.provider) {
    return NextResponse.json({ error: "Provider gerekli" }, { status: 400 });
  }
  const user = loginOAuth(body.provider, body.role ?? "brand");
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
