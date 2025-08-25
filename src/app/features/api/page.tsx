export const metadata = { title: "API" };

export default function ApiFeature() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Developer API</h1>
      <p className="text-white/70">Validate IDs in checkout and sync reporting data.</p>
      <ul className="list-disc ml-5 text-white/80">
        <li>Endpoints: ID validation, tariff lookup, reporting export</li>
        <li>Auth: API keys with per-environment scopes</li>
        <li>Rate limits & webhooks for change alerts</li>
      </ul>
    </section>
  );
}
