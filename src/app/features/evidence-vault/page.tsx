export const metadata = { title: "Evidence Vault" };

export default function EvidenceVaultFeature() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Evidence Vault</h1>
      <p className="text-white/70">Single source of truth for registration IDs, certificates, and renewals.</p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Storage: encrypted at rest, per-country folders</li>
        <li>Renewal reminders & assignment to owners</li>
        <li>Shareable links with expiry</li>
      </ul>
    </section>
  );
}
