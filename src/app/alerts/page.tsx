export const metadata = { title: "Alerts — EPR / PPWR Directory" };

export default function AlertsPage() {
  const examples = [
    { title: "France — fee modulator update", meta: "Watchlist: Packaging • Weekly digest" },
    { title: "Italy — new reporting portal", meta: "Watchlist: Reporting • Instant" },
    { title: "Romania — scope change draft", meta: "Watchlist: Scope • Daily digest" },
  ];

  return (
    <div className="space-y-8">
      <section className="hero p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight hero-title">Change Alerts</h1>
        <p className="mt-2 text-slate-700">Create watchlists and receive notifications when rules change.</p>
      </section>

      <section className="space-y-4">
        {examples.map((x) => (
          <div key={x.title} className="card-colorful">
            <div className="inner p-5">
              <div className="flex items-center justify-between">
                <div className="font-medium">{x.title}</div>
                <span className="badge-soft">{x.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
