// src/app/country/[iso]/page.tsx
import CountryClient from "./CountryClient";

// Minimal server wrapper: no data fetching here (avoids RSC errors entirely)
export default function Page({ params }: { params: { iso: string } }) {
  const iso = (params.iso || "").toUpperCase();
  return <CountryClient iso={iso} />;
}
