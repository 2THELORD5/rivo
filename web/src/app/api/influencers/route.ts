import { NextResponse } from "next/server";
import { listInfluencers } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = listInfluencers({
    niche: searchParams.get("niche") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    minFollowers: searchParams.get("minFollowers")
      ? Number(searchParams.get("minFollowers"))
      : undefined,
  });
  return NextResponse.json({ influencers: data });
}
