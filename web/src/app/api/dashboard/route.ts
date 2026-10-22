import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { agencyDashboard, dashboardStats } from "@/lib/db";

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  const role = jar.get("kolab_role")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    if (role === "agency") {
      return NextResponse.json({ type: "agency", ...agencyDashboard(uid) });
    }
    return NextResponse.json({ type: "user", ...dashboardStats(uid) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
