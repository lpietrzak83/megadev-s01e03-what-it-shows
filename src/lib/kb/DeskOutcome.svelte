<script>
  import update from '#lib/data/desk-update.json';
</script>

<section aria-labelledby="engineering-update">
  <h2 id="engineering-update">Engineering update after the export</h2>
  <p>The <a href={update.source}>course engineering notice</a>, read on {update.observedOn},
    reports source ticket #{update.sourceTicket} closed on <strong>{update.closedLabel}</strong>.
    This supersedes the export's “known / one fix queued” narrative.
    Counts remain the historical 4 October snapshot.</p>
  <table>
    <thead><tr><th scope="col">problem</th><th scope="col">desk disposition</th><th scope="col">engineering note</th><th scope="col">GitHub closure</th></tr></thead>
    <tbody>
      <tr><th scope="row">parser</th><td>{update.parser.status}</td><td>{update.parser.summary}</td>
        <td><a href="https://github.com/lpietrzak83/megadev-s01e03-what-it-shows/issues/1">#1: completed</a></td></tr>
      <tr><th scope="row">booking-v3 hint</th><td>{update.hint.status}</td><td>{update.hint.summary}</td>
        <td><a href="https://github.com/lpietrzak83/megadev-s01e03-what-it-shows/issues/2">#2: not planned</a></td></tr>
    </tbody>
  </table>
  <p>The hint was retired with the form, not fixed by the parser change.
    These outcomes are reported by engineering; no product runtime, deployment verification,
    or individual explanation of the five anomalous bodies is supplied.</p>
</section>
