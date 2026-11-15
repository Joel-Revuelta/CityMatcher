# CityMatcher design system

**Direction:** The Relocation Ledger — a civic field guide for a life decision.
**Status:** implemented in the v1.1 redesign.

The product is a decision instrument, not a travel brochure. The data is the hero:
a ranked ledger, a climate almanac, a budget sheet and a comparison matrix. The
visual language is cool paper, oxblood signal, square rules and grotesque type.

## Principles

1. **Data is the art.** No stock travel photography, no invented testimonials, no
   decorative gradients. Real numbers, real climate charts and real coordinates
   carry the page.
2. **One accent.** Oxblood is the only brand accent. Success, warning and error
   are semantic, always paired with text or an icon.
3. **Rules, not cards.** Most grouping is done with 1px rules, spacing and
   alignment. Panels are reserved for bounded tools such as the budget sheet or
   the brief drawer.
4. **Square and quiet.** Radius is 0. Shadows are removed. No glass, no blur, no
   gradient washes.
5. **One orchestrated moment.** The home ledger reveals on load; the rest of the
   product uses fast, purposeful interaction feedback.
6. **Honest states.** Loading, empty, error and over-budget states are designed
   with the same care as the happy path.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Background | `#EDEFE9` | `#101513` |
| Foreground | `#151B19` | `#E9ECE4` |
| Muted | `#E2E7DE` | `#1D2521` |
| Muted foreground | `#5E665E` | `#A7B0A7` |
| Card | `#F4F5F0` | `#161D1A` |
| Border | `#C8CEC3` | `#2C3530` |
| Primary / accent | `#7E2A2A` | `#E08A7A` |
| Primary foreground | `#F7F4EC` | `#101513` |
| Success | `#2F6B4F` | `#7DBD97` |
| Warning | `#A66A1F` | `#D8A85A` |
| Danger | `#B3261E` | `#E58980` |

All tokens live in `app/globals.css` and are mapped through Tailwind v4's
`@theme inline`. No Tailwind config file is used.

## Typography

- **Archivo** (variable) for display and body. Weights 400–700.
- **IBM Plex Mono** for numbers, costs, coordinates, dates and chart axes only.
- Display tracking no tighter than `-0.03em`; headings use `-0.04em` in the
  largest sizes.
- Body 16px, line-height 1.55, measures capped at `72ch` for long prose.
- Labels are 12px minimum and sentence case. No tracked-out all-caps labels.
- Tabular numerals for every comparison.

## Layout and shape

- Max width `1360px`, responsive page gutters.
- 12-column mental model; asymmetric 7/5 hero and 1.55/0.8 detail split.
- Radius 0 on panels, buttons, inputs, badges and dialogs.
- 1px borders and rules; no box shadows.
- Section labels are sentence case. Numbered markers appear only where the
  content is genuinely a sequence (wizard steps, ranks, method sections).
- Header is 64px, opaque, with a bottom rule. Footer is a colophon.

## Components

- **Button:** 44px high, square, primary oxblood / outline ink / ghost / soft.
- **Badge:** rectangular, 1px border, sentence case, small but legible.
- **Match score:** left oxblood rule, mono score, `/100`, tier label. No pill.
- **Metric row:** label, 1px track, mono score, bottom rule.
- **City ledger row:** `<details>` row; summary shows rank, city, climate
  sparkline, monthly cost, salary coverage and score. Expanded content shows
  reasons, trade-off, score anatomy and actions.
- **Budget sheet:** a bounded panel with a stacked rent/living bar and a ruled
  budget table.
- **Brief drawer:** native `<dialog>` right-side sheet for quick changes.
- **Climate chart:** accent high line, dashed muted low line, muted rain bars,
  mono axes. No gradient fill.

## Page patterns

- **Home:** statement + live match ledger; brief sheet with step rail; preset
  rows; three evidence columns; ink CTA block.
- **Results:** ranked ledger, brief line, sort select, expandable score anatomy.
- **City sheet:** hero with coordinates and match block; ruled stats; why-this-
  rank; climate; eleven signals; work; country context; numbered sources; sticky
  budget and fact file.
- **Compare:** grouped matrix (Money / Life / Climate / Place), sticky first
  column, explicit `best` labels, mobile swipe hint.
- **Cities index:** server-rendered GET search and filters; compact ledger rows.
- **Shortlist:** saved ledger with compact server summaries (no full dataset in
  the client bundle).
- **Method / sources / about:** long-form reading pages with constrained prose,
  ruled tables and numbered sources.

## Motion

- One hero ledger stagger (`ledger-in`, 55ms per row) and one climate line draw.
- Interaction feedback uses 150ms colour transitions; no scroll-jacking.
- No Lenis, no Three.js, no animation library.
- `prefers-reduced-motion` disables spatial motion and leaves final states.

## Copy rules

- Sentence case everywhere.
- One label per intent: **Build my brief**, **Browse cities**, **See matches**,
  **Save city**, **Compare**, **Back to matches**.
- No all-caps eyebrows, no middle-dot metadata strings, no arrow characters
  inside link text.
- Errors name the problem and the recovery. Empty states offer a next action.
- Do not claim awards, customers, partnerships or verified outcomes.

## Accessibility

- 44px touch targets; visible 2px oxblood focus ring.
- Text minimum 12px for labels; body 16px.
- Colour is never the only carrier of meaning: best values get a `best` label,
  scores have tiers, over-budget rows have text and an icon.
- Native `<details>` for row expansion and native `<dialog>` for the brief
  drawer, so keyboard and focus behaviour are platform-standard.
- Mobile menu exposes full navigation; the theme toggle is available inside it.
- Test at 200% zoom, 390px width, keyboard-only and reduced motion.

## Performance

- Results are server-rendered ledger rows, not a client-side card list.
- The shortlist receives compact summary entries, not the full city dataset.
- No blur, large shadows or continuously animated offscreen content.
- Fonts are self-managed by Next's font pipeline; map is not shipped in v1.1.
- Loading routes use ledger-shaped skeletons to avoid layout shift.

## Do not reintroduce

- Cream + serif display + terracotta accent.
- Italic accent word in the hero.
- Tracked all-caps eyebrows.
- Middle-dot metadata strings.
- Pill buttons and 1.5rem-radius cards.
- Glassmorphism, gradient washes, soft SaaS shadows.
- 29 identical result cards.
- Tiny 0.65rem labels for essential metadata.
- Colour-only “best” cells in compare.
- Full dataset imports in client components.
