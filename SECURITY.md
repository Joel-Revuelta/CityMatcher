# Security

## Legacy credential disclosure

The original Angular hackathon build (`legacy/angular-v18` branch) committed an OpenAI API
key in `src/environments/environment.ts` and `environment.prod.ts`. It is **not** present in
the current working tree, and the current app never calls a model from the browser.

Because the key exists in the repository's git history, treat it as compromised:

1. Revoke the key in the OpenAI dashboard immediately.
2. Review usage and billing for unexpected activity.
3. Purge it from history with `git filter-repo` or the GitHub secret-scanning flow, then
   coordinate a force-push with any collaborators.
4. Never reuse the key.

## Current app

- Optional AI keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) are read server-side only.
- Every AI route validates input, rate-limits requests and falls back to the deterministic
  parser on failure.
- Security headers are set in `next.config.ts`.
- Dependencies are pinned in `pnpm-lock.yaml`; `pnpm audit` is clean at v1 verification;
  Dependabot is configured for weekly updates.
- The app stores only a city shortlist and colour preference in `localStorage`.

## Reporting

If you find a vulnerability, please open a private security advisory on the repository rather
than a public issue.
