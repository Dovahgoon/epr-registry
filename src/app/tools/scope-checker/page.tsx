export const metadata = { title: "Scope Checker" };

export default function ScopeChecker() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scope Checker</h1>
      <p className="text-white/70">
        Quick decision aid to see if a package/SKU triggers EPR in a target country.
      </p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Inputs: packaging type, filled/unfilled, sales model (B2B/B2C), importer/producer role</li>
        <li>Output: in-scope/ out-of-scope with rationale and references</li>
        <li>Status: rules engine to be wired to country playbooks</li>
      </ul>
    </div>
  );
}
