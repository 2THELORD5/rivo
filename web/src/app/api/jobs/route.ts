import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createJob, listJobsForUser } from "@/lib/db";

export async function GET(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return NextResponse.json({ jobs: listJobsForUser(uid, { status }) });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    const body = await req.json();
    const job = createJob(uid, body);
    return NextResponse.json({ job });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
