import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  listMessagesForThread,
  listThreadsForUser,
  sendMessage,
} from "@/lib/db";

export async function GET(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const thread = new URL(req.url).searchParams.get("thread");
  if (thread) {
    try {
      const messages = listMessagesForThread(uid, thread);
      return NextResponse.json({ messages });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Hata" },
        { status: 403 },
      );
    }
  }
  return NextResponse.json({ threads: listThreadsForUser(uid) });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const uid = jar.get("kolab_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    const body = (await req.json()) as { threadId: string; body: string };
    const message = sendMessage(uid, body);
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hata" },
      { status: 400 },
    );
  }
}
