# Verification log — v1.1 redesign

**Date:** 2026-11-15
**Runtime:** Node 24.14.0, pnpm 11.22.0, Next.js 16.4.6
**Result:** v1.1 "Relocation Ledger" redesign verified end to end.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Clean install | `pnpm install --frozen-lockfile` | Lockfile accepted |
| Dependency audit | `pnpm audit` | No known vulnerabilities |
| Lint | `pnpm lint` | Passed, no findings |
| Types | `pnpm typecheck` | Passed, no errors |
| Unit tests | `pnpm test` | 4 files / 28 tests passed |
| Dataset QA | `pnpm data:qa` | 42 cities, 27 countries, 100% coverage, 0 errors |
| Production build | `pnpm build` | Passed; 17 routes generated |

Routes include the new `/cities` index and its loading state, plus ledger loading
states for `/results` and `/city/[slug]`.

## Runtime smoke test

| Endpoint | Status | HTML size |
| --- | --- | --- |
| `/` | 200 | 83.4 KB |
| `/results?b=2500` | 200 | 268.3 KB |
| `/results?b=2500&page=2` | 200 | — |
| `/cities` | 200 | 286.5 KB |
| `/city/lisbon` | 200 | 138.4 KB |
| `/compare?c=lisbon,vienna` | 200 | 93.1 KB |
| `/methodology`, `/sources`, `/about` | 200 | — |
| `/api/match?b=2500&limit=2` | 200 | — |
| `POST /api/parse` | 200 | — |
| `/opengraph-image` | 200, PNG 1200×630 | 64.9 KB |
| `/city/does-not-exist` | 404 | — |

The results page was reduced from the previous ~453 KB card grid to a paginated
ledger (15 rows per page); the expanded row now shows a compact 5-signal anatomy
and links to the full city sheet.

## Interactive smoke test (Playwright, Chromium)

1. Opened the home page; h1 reads “A city that fits the life you want.”
2. Entered “warm, walkable, safe, remote work, under €2,000”; parser chips appeared.
3. The live count updated (“cities fit”).
4. Continued through the brief sheet, applied “Remote worker”, entered income.
5. Opened matches: 6 results; expanded the first row; the city sheet link and
   actions were visible.
6. Saved and compared the first city; the header count and compare bar updated.
7. Opened the brief drawer, selected Northern Europe, applied; URL gained
   `r=northern`.
8. Searched the `/cities` index for “Lisbon”; the Lisbon row appeared.
9. Opened `/shortlist`; the saved city was present.
10. Mobile menu opened and exposed the full navigation.
11. Page console/page errors: **0**.

## Visual checks

Captured at 1440×1000 and 390×844, light and dark:

- Home: hero ledger, brief sheet, presets, evidence columns, ink CTA.
- Results: paginated ledger, score blocks, sort, brief drawer.
- City sheet: hero, climate almanac, signal rows, budget sheet, sources.
- Compare: desktop grouped matrix and a dedicated two-city mobile diff view.
- `/cities`: searchable directory and filters.
- Shortlist: empty state and saved ledger.
- Methodology/sources/about: constrained prose and ruled tables.

The theme toggle, native `<details>` expansion, native `<dialog>` drawer, mobile
navigation, keyboard focus rings, pagination and compare best-markers were
exercised. `prefers-reduced-motion` leaves final states; no scroll engine,
Three.js or animation library is shipped.

## Design system

The direction, tokens, typography, component rules and “do not reintroduce” list
are in [`docs/DESIGN.md`](DESIGN.md). The redesign removed the previous
cream/serif/terracotta identity, all-caps eyebrows, middle-dot metadata,
pill controls, glass header, gradient washes, identical result cards and
colour-only compare winners.

## Security notes

- No secret is read client-side; optional AI keys are server-only environment
  variables.
- The legacy OpenAI key was removed from the working tree and must still be
  revoked and purged from git history by the owner. See `SECURITY.md`.
- `pnpm audit` is clean at verification time.

## Known v1 limits (disclosed in the UI)

- Cost, salary and composite livability values are modelled, not official statistics.
- Visas, tax residence and occupation-level salary offers are out of scope.
- The shortlist is local to the browser; accounts and alerts are post-v1.
- English only; the city index has no map view yet.
