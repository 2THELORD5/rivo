import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("kolab_uid", "", { path: "/", maxAge: 0 });
  res.cookies.set("kolab_role", "", { path: "/", maxAge: 0 });
  return res;
}
