export const metadata = { title: "EU Directory" };

export default function EuDirectoryFeature() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">EU Directory</h1>
      <p className="text-white/70">
        Central catalogue of country rules (DE, FR, ES, IT, NL; GR/RO/CY next), PROs, registration steps, and contacts.
      </p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Playbooks: scope, thresholds, reporting cadence, labeling</li>
        <li>PROs: fees snapshot, contact details, onboarding steps</li>
        <li>Data: offline-first JSON with scheduled refresh</li>
      </ul>
    </section>
  );
}
