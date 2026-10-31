# [4471 / parser] Shared parser reads day-first tenant dates as month-first — 379 reports

## Count and provenance

379 unique reports, 11 tenants, received 2026-04-01 through 2026-10-04. Snapshot: support kb export 2026-10-04. Reviewed: 2026-10-31. All were historically merged into source support ticket #4471; that source number is not a GitHub issue number.

427 raw JSON rows contain 412 unique report IDs and 15 exact overlaps. Count once by ID, resolve tenant locale/form from src/lib/data/tenants, then use channel and the supplied causes.ts model. Intake tags/browser locale are not tenant truth.

## Behavior and scope

The shared parser reads month first for day-first tenants. Scope: app/email plus applicable booking-v2 form paths. Booking-v3 form reports have a separate hint defect.

Suggested reproduction to verify (derived from the supplied model): with Harbour Dental (en-GB), app input 07/04/2026: intended 7 April is interpreted as 4 July. R-41200 and R-41203 show month/day reversals. Expected: preserve the intended tenant-local calendar date in the booking and invite.
## Unresolved observations included in this count

- R-41202: Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.
- R-41209: Every booking in June is one day off. Only June. Why only June.
- R-41236: The invite arrived before I made the booking. I would like to know how.
- R-41344: Client in Lisbon got Tuesday. Client in Toronto got Monday. Same meeting. We held it twice.
- R-41620: Tuesday 6 October showed as Monday. I moved it myself. I have stopped reporting these but my colleague says it helps you.

These five are included in the 379 contextual parser cohort, not added to it. Their bodies do not prove month/day reversal. R-41236 does not explicitly report a one-day shift. No evidence here confirms timezone/DST or one third common cause. Keep these cases open for input, timestamp and tenant/timezone investigation before closure. The remaining 374 reports are outside this explicit anomaly list; this is not a claim of individual causal verification.

## Verification before closure

No product runtime is included in this export. These are proposed regression checks, not tests executed against the product.

Test ambiguous numeric dates with a known intended date, all affected tenant/channel paths, differing browser and tenant locales, and the other defect independently. No fix is claimed deployed or verified by this export.

## Sources

- src/lib/data/reports-4471.json
- src/lib/data/tenants/*.json
- src/lib/kb/causes.ts and locales.ts
- evidence.json (complete distinct-ID assignment)
- src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx
- rendered/kb/decisions/0002-dedupe-by-cause/index.html

The preserved ticket-system data has not been actually re-filed by publishing this issue.
