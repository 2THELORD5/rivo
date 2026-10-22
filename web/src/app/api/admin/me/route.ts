import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const ok = jar.get("rivo_admin")?.value === "1";
  if (!ok) return NextResponse.json({ admin: false }, { status: 401 });
  return NextResponse.json({ admin: true });
}
