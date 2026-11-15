import { NextResponse } from "next/server";
import { parsePreferences } from "@/lib/parse";
import { isAiConfigured, parseWithAi } from "@/lib/ai";
import { allowRequest, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!allowRequest(`parse:${clientKey(request)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text =
    body && typeof body === "object" && "text" in body
      ? (body as { text?: unknown }).text
      : null;

  if (typeof text !== "string" || text.trim().length < 3) {
    return NextResponse.json(
      { error: "Provide a short description of what you want." },
      { status: 400 },
    );
  }
  if (text.length > 400) {
    return NextResponse.json(
      { error: "Keep the description under 400 characters." },
      { status: 400 },
    );
  }

  const fallback = parsePreferences(text);
  if (!isAiConfigured()) {
    return NextResponse.json({
      parsed: fallback,
      source: "rules" as const,
      aiConfigured: false,
    });
  }

  const ai = await parseWithAi(text);
  return NextResponse.json({
    parsed: ai ?? fallback,
    source: ai ? ("ai" as const) : ("rules" as const),
    aiConfigured: true,
  });
}
