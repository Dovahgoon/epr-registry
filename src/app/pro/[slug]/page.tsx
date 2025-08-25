// src/app/pro/[slug]/page.tsx
import Link from "next/link";
import { getCatalog, slugify } from "@/lib/data";

export const runtime = "nodejs";

export default async function ProPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const catalog = await getCatalog();

  // Find PRO by slugified name
  const pro = (catalog.pros || []).find((p: any) => slugify(p.name) === slug);

  if (!pro) {
    return (
      <div className="space-y-4">
        <h1 className="h1">PRO not found</h1>
        <Link className="btn" href="/">Back</Link>
      </div>
    );
  }

  // Resolve country: prefer ISO-2, fall back to name matching
  const iso2 = String((pro as any).countryIso2 || (pro as any).country || "").toUpperCase();
  const byIso = catalog.countries.find((c: any) => String(c.iso2).toUpperCase() === iso2);
  const countryNameField = String((pro as any).countryName || (pro as any).country || "");
  const byName = catalog.countries.find((c: any) => String(c.name).toLowerCase() === countryNameField.toLowerCase());
  const country = byIso || byName;
  const backHref = country ? `/country/${String(country.iso2).toLowerCase()}` : "/";

  return (
    <div className="space-y-6">
      <div className="hero">
        <div>
          <h1>{pro.name}</h1>
          <p className="muted">
            {country ? <><strong>{country.name}</strong> ({country.iso2})</> : iso2 ? <>Country: {iso2}</> : <>Country: N/A</>}
            {pro.type ? <> &nbsp;— <span className="badge">{pro.type}</span></> : null}
          </p>
        </div>
        <Link className="btn" href={backHref}>← Back</Link>
      </div>

      <div className="card">
        <ul className="list">
          {pro.url ? <li><strong>Website:</strong> <a href={pro.url} target="_blank" rel="noopener noreferrer">{pro.url}</a></li> : null}
          {pro.email ? <li><strong>Email:</strong> <a href={`mailto:${pro.email}`}>{pro.email}</a></li> : null}
          {pro.phone ? <li><strong>Phone:</strong> {pro.phone}</li> : null}
          {pro.address ? <li><strong>Address:</strong> {pro.address}</li> : null}
          {!pro.url && !pro.email && !pro.phone && !pro.address ? <li className="muted">No additional details.</li> : null}
        </ul>
      </div>
    </div>
  );
}
