import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const mistakes = await store.getMistakes();
  return NextResponse.json({ mistakes });
}
