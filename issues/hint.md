# [4471 / hint] Booking-v3 date hint conflicts with tenant convention — 33 reports

## Count and provenance

33 unique reports, 3 tenants, received 2026-04-17 through 2026-09-22. Snapshot: support kb export 2026-10-04. Reviewed: 2026-10-31. All were historically merged into source support ticket #4471; that source number is not a GitHub issue number.

427 raw JSON rows contain 412 unique report IDs and 15 exact overlaps. Count once by ID, resolve tenant locale/form from src/lib/data/tenants, then use channel and the supplied causes.ts model. Intake tags/browser locale are not tenant truth.

## Behavior and scope

Booking-v3 prints MM/DD/YYYY while its form reads the tenant day-first convention. Scope: form channel at Alder Physio (de-DE), Copper Studio (es-ES), Pale Harbour (pt-PT). App/email reports at the same tenants belong to the parser cohort.

Suggested reproduction to verify (derived from the supplied model): with a day-first booking-v3 tenant: follow MM/DD/YYYY to enter 6 January as 01/06/2026; the tenant-local form interprets 1 June. Expected: the displayed hint, accepted input and resulting booking agree. R-41230 and R-41241 are example reports in this cohort.
## Independent fix

Correct tenant-local hint/validation consistency. A shared-parser fix alone does not repair this UI/input contract. Check the same browser locale against different tenant locales and both booking form versions.

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
