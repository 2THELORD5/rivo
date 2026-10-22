import { NextResponse } from "next/server";
import { scanContract } from "@/lib/db";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  if (!text || text.trim().length < 20) {
    return NextResponse.json(
      { error: "En az birkaç cümle sözleşme metni yapıştırın" },
      { status: 400 },
    );
  }
  return NextResponse.json({ risks: scanContract(text) });
}
