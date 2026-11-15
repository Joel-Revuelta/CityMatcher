# Verification log — v1

**Date:** 2026-11-15
**Runtime:** Node 24.14.0, pnpm 11.22.0, Next.js 16.4.6
**Result:** v1 verified end to end.

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Clean install | `pnpm install --frozen-lockfile` | Lockfile accepted |
| Dependency audit | `pnpm audit` | No known vulnerabilities |
| Lint | `pnpm lint` | Passed, no findings |
| Types | `pnpm typecheck` | Passed, no errors |
| Unit tests | `pnpm test` | 4 files / 28 tests passed |
| Dataset QA | `pnpm data:qa` | 42 cities, 27 countries, 100% country + climate coverage, 0 warnings, 0 errors |
| Production build | `pnpm build` | Passed; 16 routes generated |

Production route table:

```
ƒ /                    dynamic home with live preview + wizard
○ /_not-found
○ /about
ƒ /api/match
ƒ /api/parse
ƒ /city/[slug]
ƒ /compare
○ /icon.svg
○ /manifest.webmanifest
○ /methodology
○ /opengraph-image
ƒ /results
○ /robots.txt
○ /shortlist
○ /sitemap.xml
○ /sources
```

## Runtime smoke test

Production server: `pnpm start` on `http://localhost:3000`.

| Endpoint | Status |
| --- | --- |
| `/` | 200 |
| `/results?b=2500` | 200 |
| `/city/lisbon?b=2500` | 200 |
| `/compare?c=lisbon,vienna` | 200 |
| `/methodology` | 200 |
| `/sources` | 200 |
| `/api/match?b=2500&limit=3` | 200 |
| `POST /api/parse` with a natural-language brief | 200 |
| `/city/does-not-exist` | 404 |
| `/opengraph-image` | 200, image/png, 1200×630 |

Security headers confirmed on `/`: `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options: DENY`, `Permissions-Policy`.

## Interactive smoke test (Playwright, Chromium)

1. Entered “warm, walkable, safe, remote work, under €2,000” → chips appeared.
2. Continued to priorities, applied the “Remote worker” preset.
3. Continued to context, entered a €3,200 income.
4. Opened matches → 6 result cards, headed “6 cities fit your brief.”
5. Saved the first city → header shortlist count became 1.
6. Opened `/shortlist` → saved city was present.
7. Opened `/compare?c=lisbon,vienna` → 20 comparison rows, both cities present.
8. Page console/page errors: **0**.

A second pass verified edited-brief prefill, the empty-results state, a four-way comparison,
dark-mode persistence after reload, and shortlist persistence after reload. Visual checks
were captured at 1440×1000 and 390×844 in light and dark mode for the home, results, city
profile and comparison pages. No layout breakage or contrast blockers were observed.

## Tooling notes

- **Package manager:** pnpm 11.22.0. `package-lock.json` was removed; `pnpm-lock.yaml` is
  committed. CI uses `pnpm/action-setup` and a frozen lockfile.
- **ESLint:** pinned to 9.39.5 because `eslint-config-next@16.4.6`'s bundled ESLint plugins
  still declare support only through ESLint 9. ESLint 10 produced peer warnings.
- **Audit override:** `@typescript-eslint/typescript-estree` pins `minimatch ^10.2.2`, which
  falls under a moderate dev-only DoS advisory. `pnpm-workspace.yaml` overrides it to
  `11.0.8` (patched), and lint is verified with that override. Node 22.12+ is required for
  the ESM/CJS interop. Production dependencies audit clean independently.

## Security notes

- The leaked OpenAI key was removed from the new working tree.
- No secret is read client-side; optional AI keys are server-only environment variables.
- The old key still exists in git history of the legacy commit and on the remote. **The owner
  must revoke it in the OpenAI dashboard and purge history before making the repository
  public-facing again.** The legacy Angular build is preserved on `legacy/angular-v18`.

## Known v1 limits (disclosed in the UI)

- Cost, salary and composite livability values are modelled, not official statistics.
- Visas, tax residence and occupation-level salary offers are out of scope.
- The shortlist is local to the browser; accounts and alerts are post-v1.
- English only; no translation layer yet.
