import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const completed = await store.getCompletedChapters();
  const streak = await store.getStreak();
  return NextResponse.json({ completed, streak });
}
