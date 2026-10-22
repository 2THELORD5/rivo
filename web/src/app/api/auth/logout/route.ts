import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
}
