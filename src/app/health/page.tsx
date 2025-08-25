export const metadata = { title: "Health — EPR / PPWR Directory" };

export default function HealthPage() {
  const checks = [
    { name: "API", status: "Operational" },
    { name: "Database", status: "Operational" },
    { name: "Background jobs", status: "Operational" },
  ];

  return (
    <div className="space-y-8">
      <section className="hero p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight hero-title">System Health</h1>
        <p className="mt-2 text-slate-700">High‑level status of public services (placeholder).</p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((c) => (
          <div key={c.name} className="card-colorful">
            <div className="inner p-5 flex items-center justify-between">
              <div className="font-medium">{c.name}</div>
              <span className="badge-soft">{c.status}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
