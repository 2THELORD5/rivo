import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getJobForUser,
  listApplicationsForJob,
  updateJobStatus,
} from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const job = getJobForUser(uid, id);
    if (!job) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    const applications = listApplicationsForJob(uid, id);
    return NextResponse.json({ job, applications });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { status: "open" | "closed" | "filled" };
    const job = updateJobStatus(uid, id, body.status);
    return NextResponse.json({ job });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
