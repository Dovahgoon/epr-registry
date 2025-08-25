import Link from "next/link";

export const metadata = { title: "Vault — EPR / PPWR Directory" };

export default function VaultLanding() {
  return (
    <div className="space-y-8">
      <section className="hero p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight hero-title">Evidence Vault</h1>
        <p className="mt-2 text-slate-700">
          Store registration numbers, certificates, and renewal reminders in one secure place.
        </p>
      </section>

      <div className="card-colorful">
        <div className="inner p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-700">
            Access the secure area to upload or retrieve documents.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border px-4 py-2 text-sm">Login</Link>
            <Link href="/account/vault" className="rounded-full border px-4 py-2 text-sm">
              Go to secure Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
