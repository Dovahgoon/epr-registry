export const metadata = { title: "Change Alerts" };

export default function ChangeAlertsFeature() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Change Alerts</h1>
      <p className="text-white/70">
        Track legislative updates, tariff changes, and reporting deadlines across your watchlist.
      </p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Sources: official PRO & ministry sites</li>
        <li>Delivery: inbox, webhook, or in-app notifications</li>
        <li>Diffs with redlines & effective dates</li>
      </ul>
    </section>
  );
}
