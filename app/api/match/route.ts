import { NextResponse } from "next/server";
import { getAllCities, METHODOLOGY_VERSION } from "@/lib/data";
import { decodePreferences } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";
import { allowRequest, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!allowRequest(`match:${clientKey(request)}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const url = new URL(request.url);
  const prefs = decodePreferences(url.searchParams);
  const outcome = rankCities(getAllCities(), prefs);
  const requestedLimit = Number(url.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(50, Math.max(1, Math.round(requestedLimit)))
    : 20;

  return NextResponse.json({
    methodologyVersion: METHODOLOGY_VERSION,
    preferences: prefs,
    ...outcome,
    results: outcome.results.slice(0, limit).map((result) => ({
      slug: result.city.slug,
      name: result.city.name,
      country: result.city.country,
      score: result.score,
      tier: result.tier,
      totalMonthly: result.totalMonthly,
      leftover: result.leftover,
      overBudget: result.overBudget,
      reasons: result.reasons,
      breakdown: result.breakdown,
    })),
  });
}
