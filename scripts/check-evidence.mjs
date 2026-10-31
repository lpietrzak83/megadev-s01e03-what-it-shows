import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { causeOf, dayFirst, groupByCause, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { DEDUPE_CASES } from '../src/lib/kb/dedupe-cases.ts';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const raw = read('../src/lib/data/reports-4471.json');
const tenants = readdirSync(new URL('../src/lib/data/tenants/', import.meta.url))
  .map(n => read('../src/lib/data/tenants/' + n));
const byHandle = new Map(tenants.map(t => [t.handle, t]));
const tenantOf = r => byHandle.get(r.tenant);
const notes = read('../src/lib/data/desk-notes.json');
const deskUpdate = read('../src/lib/data/desk-update.json');
const reports = uniqueById(raw).filter(r => r.mergedInto === 4471);
for (const r of raw) assert.deepEqual(r, reports.find(x => x.id === r.id), 'Overlapping rows must agree');
assert.equal(raw.length, 427);
assert.equal(reports.length, 412);
assert(reports.every(r => tenantOf(r)), 'Unknown tenant in source reports');
assert(tenants.every(t => dayFirst(t.locale)), 'Verify tenant date order through Intl');
assert.equal(dayFirst('en-US'), false);
const groups = groupByCause(reports, tenantOf);
assert.deepEqual(Object.fromEntries(groups.map(g => [g.cause, g.reports.length])), {parser:379, hint:33});
assert.equal(groups.flatMap(g => g.reports).length, reports.length);
assert.equal(new Set(groups.flatMap(g => g.reports.map(r => r.id))).size, reports.length);
assert.deepEqual(DEDUPE_CASES.map(c => sameCause(c.a,tenantOf(c.a),c.b,tenantOf(c.b))), [true,false,false,true,false]);
const anomalies = reports.filter(r => notes.oneDayMove.includes(r.id));
assert.equal(anomalies.length,5);
assert(anomalies.every(r => causeOf(r,tenantOf(r)) === 'parser'));
const evidence = {
  snapshot:'2026-10-04', reviewed:'2026-10-31', rawRows:raw.length,
  uniqueReports:reports.length, duplicateOverlaps:raw.length-reports.length,
  groups:groups.map(g => ({cause:g.cause,count:g.reports.length,tenants:g.tenants,firstSeen:g.firstSeen,lastSeen:g.lastSeen,taggedAs:g.taggedAs,reportIds:g.reports.map(r=>r.id)})),
  misleadingTags:groups.flatMap(g => g.reports.filter(r=>r.meta.intakeTag!==g.cause)).length,
  unresolvedParserCohortIds:anomalies.map(r=>r.id),
  firstMerge:reports.map(r=>r.mergedAt).sort()[0],
  reportsBeforeFirstMergeDay:reports.filter(r=>r.receivedAt.slice(0,10)<reports.map(r=>r.mergedAt).sort()[0].slice(0,10)).length
};
mkdirSync(new URL('../issues/', import.meta.url),{recursive:true});
writeFileSync(new URL('../evidence.json', import.meta.url), JSON.stringify(evidence,null,2)+'\n');
for (const g of groups) {
  const parser = g.cause === 'parser';
  const title = parser ? '[4471 / parser] Shared parser reads day-first tenant dates as month-first — '+g.reports.length+' reports'
    : '[4471 / hint] Booking-v3 date hint conflicts with tenant convention — '+g.reports.length+' reports';
  const mechanism = parser
    ? 'The shared parser reads month first for day-first tenants. Scope: app/email plus applicable booking-v2 form paths. Booking-v3 form reports have a separate hint defect.\n\nSuggested reproduction to verify (derived from the supplied model): with Harbour Dental (en-GB), app input 07/04/2026: intended 7 April is interpreted as 4 July. R-41200 and R-41203 show month/day reversals. Expected: preserve the intended tenant-local calendar date in the booking and invite.'
    : 'Booking-v3 prints MM/DD/YYYY while its form reads the tenant day-first convention. Scope: form channel at Alder Physio (de-DE), Copper Studio (es-ES), Pale Harbour (pt-PT). App/email reports at the same tenants belong to the parser cohort.\n\nSuggested reproduction to verify (derived from the supplied model): with a day-first booking-v3 tenant: follow MM/DD/YYYY to enter 6 January as 01/06/2026; the tenant-local form interprets 1 June. Expected: the displayed hint, accepted input and resulting booking agree. R-41230 and R-41241 are example reports in this cohort.';
  const caveat = parser
    ? '\n## Unresolved observations included in this count\n\n'+anomalies.map(r=>'- '+r.id+': '+r.body).join('\n')+'\n\nThese five are included in the 379 contextual parser cohort, not added to it. Their bodies do not prove month/day reversal. R-41236 does not explicitly report a one-day shift. No evidence here confirms timezone/DST or one third common cause. Retain these observations for separate input, timestamp and tenant/timezone follow-up if symptoms recur. The later engineering notice governs the ticket closure; it does not individually explain the observations. The remaining 374 reports are outside this explicit anomaly list; this is not a claim of individual causal verification.'
    : '\n## Original fix proposal (superseded by form retirement)\n\nAt snapshot time, a repair would have aligned tenant-local hints and validation. A shared-parser fix alone would not have repaired this UI/input contract. Proposed checks compared browser and tenant locales and both form versions. Engineering subsequently retired booking-v3 instead of fixing its hint.';
  const body = '# '+title+'\n\n## Count and provenance\n\n'+g.reports.length+' unique reports, '+g.tenants+' tenants, received '+g.firstSeen+' through '+g.lastSeen+'. Snapshot: support kb export 2026-10-04. Reviewed: 2026-10-31. All were historically merged into source support ticket #4471; that source number is not a GitHub issue number.\n\n427 raw JSON rows contain 412 unique report IDs and 15 exact overlaps. Count once by ID, resolve tenant locale/form from src/lib/data/tenants, then use channel and the supplied causes.ts model. Intake tags/browser locale are not tenant truth.\n\n## Behavior and scope\n\n'+mechanism+caveat+'\n\n## Original verification proposal (not executed)\n\nNo product runtime is included in this export. These are proposed regression checks, not tests executed against the product. The later engineering notice supersedes this proposal for ticket disposition.\n\nTest ambiguous numeric dates with a known intended date, all affected tenant/channel paths, differing browser and tenant locales, and the other defect independently. No fix is claimed deployed or verified by this export.\n\n## Sources\n\n- src/lib/data/reports-4471.json\n- src/lib/data/tenants/*.json\n- src/lib/kb/causes.ts and locales.ts\n- evidence.json (complete distinct-ID assignment)\n- src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx\n- rendered/kb/decisions/0002-dedupe-by-cause/index.html\n\nThe preserved ticket-system data has not been actually re-filed by publishing this issue.\n';

  const outcome = deskUpdate[g.cause];
  const disposition = '\n## Engineering disposition\n\nSource: ' + deskUpdate.source
    + ' (engineering update observed ' + deskUpdate.observedOn + '). Source #4471 is reported closed on '
    + deskUpdate.closedLabel + '.\n\n**' + outcome.status + '** — ' + outcome.summary
    + '. GitHub closure reason: **' + outcome.reason + '**.\n\n'
    + (parser
      ? 'Closed as completed based on the course engineering notice. This is not an independently executed product regression or deployment verification, and does not individually explain the five anomalous source bodies. Preserve them for follow-up if they recur.'
      : 'Closed as not planned because booking-v3 was retired. The hint defect was not fixed by the parser change; its affected form was removed. The historical report count remains valid.')
    + '\n';
  writeFileSync(new URL('../issues/'+g.cause+'.md', import.meta.url),body + disposition);
}
console.log(JSON.stringify({checks:'PASS',rawRows:raw.length,unique:reports.length,groups:evidence.groups.map(({cause,count})=>({cause,count})),misleadingTags:evidence.misleadingTags,anomalies:anomalies.length,dedupeCases:5}));
