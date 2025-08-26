// app/api/me/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8000";

  try {
    const res = await fetch(`${base}/me`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
