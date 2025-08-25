export const metadata = { title: "Fee Calculators" };

export default function FeeCalculatorsFeature() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Fee Calculators</h1>
      <p className="text-white/70">Tariff-aware estimators per country and material.</p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Material mapping: paper, plastic, glass, metal, wood, composite</li>
        <li>Country tariffs with versioning & audit trail</li>
        <li>Exports: CSV, PDF summary</li>
      </ul>
    </section>
  );
}
