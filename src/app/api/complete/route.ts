import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const { chapterSlug } = await req.json();
  if (typeof chapterSlug !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const store = getStore();
  await store.markChapterComplete(chapterSlug);
  const completed = await store.getCompletedChapters();
  return NextResponse.json({ ok: true, completed });
}
