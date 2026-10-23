import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const { chapterSlug, questionId, correct } = await req.json();

  if (typeof chapterSlug !== "string" || typeof questionId !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const store = getStore();
  await store.recordAnswer(chapterSlug, questionId, Boolean(correct));
  const streak = await store.recordActivity();

  return NextResponse.json({ ok: true, streak });
}
