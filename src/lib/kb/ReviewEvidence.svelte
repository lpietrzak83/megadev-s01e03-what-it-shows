<script lang="ts">
  import raw from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  const reports = uniqueById(raw as Report[]).filter(r => r.mergedInto === 4471);
  const groups = groupByCause(reports, tenantOf);
  const anomalous = reports.filter(r => notes.oneDayMove.includes(r.id));
  const mistagged = groups.flatMap(g => g.reports.filter(r => r.meta.intakeTag !== g.cause));
  const firstMerge = reports.map(r => r.mergedAt!).sort()[0].slice(0, 10);
  const before = reports.filter(r => r.receivedAt.slice(0, 10) < firstMerge).length;
  const onDay = reports.filter(r => r.mergedAt!.slice(0, 10) === firstMerge).length;
  const months = [...new Set(reports.map(r => r.receivedAt.slice(0, 7)))].sort();
</script>

<p><strong>{raw.length}</strong> exported rows → <strong>{reports.length}</strong> unique reports;
  <strong>{raw.length - reports.length}</strong> exact overlapping rows are counted once by report ID.
  All unique reports belong to #4471 in this snapshot.</p>
<p>Tenant locale, booking form and channel place the reports in the cohorts shown above.
  <strong>{mistagged.length}</strong> intake tags disagree with those cohorts; browser locale and intake tags
  are not evidence of the tenant's date convention.</p>

<h2>Receipt and consolidation are different events</h2>
<p>The earliest merge is <strong>{firstMerge}</strong>. Before that day,
  <strong>{before}</strong> reports had arrived; <strong>{onDay}</strong> were merged on the first merge day.
  This is evidence of delayed consolidation, not evidence that nobody investigated or acted before then.</p>
<table>
  <caption>Reports received by month, deduplicated by ID</caption>
  <thead><tr><th scope="col">month</th>{#each groups as g}<th scope="col">{g.cause}</th>{/each}</tr></thead>
  <tbody>{#each months as month}<tr><th scope="row">{month}</th>
    {#each groups as g}<td>{g.reports.filter(r => r.receivedAt.startsWith(month)).length}</td>{/each}
  </tr>{/each}</tbody>
</table>

<h2>Body anomalies requiring follow-up</h2>
<p><strong>{anomalous.length}</strong> records from desk-notes.json are included in the parser cohort.
  Their bodies do not demonstrate a month/day reversal. They are unresolved observations,
  not additional reports and not proof of one shared third root cause, timezone bug or DST bug.</p>
<div class="wide"><table>
  <thead><tr><th scope="col">report</th><th scope="col">tenant / channel</th><th scope="col">reported observation</th></tr></thead>
  <tbody>{#each anomalous as r}<tr><th scope="row">{r.id}</th><td>{r.tenant}<br />{r.channel}</td><td>{r.body}</td></tr>{/each}</tbody>
</table></div>
<p>In particular R-41236 reports an invite arriving before the booking; it does not specify a one-day interval.
  Keep every original ID and body. Obtain input values, booking/notification timestamps, tenant settings
  and timezone evidence before assigning a confirmed cause or closing these cases.</p>

<style>
  caption { text-align: left; font-weight: 600; margin-bottom: .4rem; }
  .wide { overflow-x: auto; }
  td { vertical-align: top; }
</style>
