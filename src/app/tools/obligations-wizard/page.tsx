export const metadata = { title: "Obligations Wizard" };

export default function ObligationsWizard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Obligations Wizard</h1>
      <p className="text-white/70">
        Guides you through producer registration, PRO selection, reporting cadence, and labeling rules.
      </p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Inputs: country, annual volumes, materials, local entity vs. importer</li>
        <li>Output: checklist with links, forms, and contacts</li>
        <li>Status: connects to the EU Directory and Evidence Vault</li>
      </ul>
    </div>
  );
}
