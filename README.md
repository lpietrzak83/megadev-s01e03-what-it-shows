# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review and reproducible render

The original export is retained. Active incident and triage pages are corrected by
`src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`; accepted decision 0001 and raw data are unchanged.

Requires Node 22.17+ (verified with Node 26.13.0).

```sh
rtk npm ci --ignore-scripts --no-audit --no-fund
rtk npm run check
rtk npm run build
rtk proxy python3 -m http.server 8373 --bind 127.0.0.1 --directory rendered
```

Open `http://127.0.0.1:8373/kb/decisions/0002-dedupe-by-cause/`.
The complete static site, including CSS and hydration assets, is in `rendered/`.
The review HTML is `rendered/kb/decisions/0002-dedupe-by-cause/index.html`.
`evidence.json` assigns every unique report to exactly one contextual cause cohort.
`issues/parser.md` and `issues/hint.md` hold the exact published issue bodies.
Product-runtime regression checks remain proposed; this export has no working booking product.

Published tickets: [parser, 379 reports](https://github.com/lpietrzak83/megadev-s01e03-what-it-shows/issues/1) and [booking-v3 hint, 33 reports](https://github.com/lpietrzak83/megadev-s01e03-what-it-shows/issues/2).

The later course engineering notice reports #4471 closed on 05 oct: parser FIXED;
hint WON'T FIX because booking-v3 form retired. It is preserved in src/lib/data/desk-update.json
and shown separately from the unchanged 4 October report export.
