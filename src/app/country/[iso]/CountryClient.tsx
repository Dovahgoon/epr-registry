// src/app/country/[iso]/CountryClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./country-ui.module.css";

type ItemLink = { name: string; url?: string };

type RegistryItem = {
  country: string; // ISO-2
  updatedAt?: string;
  regulators?: unknown; // accept array/object/mixed
  pros?: unknown;       // accept array/object/mixed
};
type Registry = { ok?: boolean; year?: string | number; items?: RegistryItem[] };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeLinks(v: unknown): ItemLink[] {
  if (!v) return [];
  // Case A: array
  if (Array.isArray(v)) {
    return (v as unknown[]).map((x): ItemLink => {
      if (isObj(x)) {
        const xx = x as Record<string, unknown>;
        const name = String(xx.name ?? xx.label ?? xx.title ?? "");
        const url = typeof xx.url === "string" ? xx.url : undefined;
        return { name, url };
      }
      if (Array.isArray(x) && x.length >= 1) {
        const name = String(x[0]);
        const url = x[1] != null ? String(x[1] as any) : undefined;
        return { name, url };
      }
      return { name: String(x) };
    }).filter(it => it.name);
  }
  // Case B: object with {items: [...]}
  if (isObj(v) && Array.isArray((v as Record<string, unknown>).items as unknown[])) {
    return normalizeLinks((v as Record<string, unknown>).items);
  }
  // Case C: plain object map {"Name": "https://..."} or nested objects
  if (isObj(v)) {
    const entries = Object.entries(v as Record<string, unknown>);
    return entries.map(([k, val]): ItemLink => {
      if (isObj(val)) {
        const vv = val as Record<string, unknown>;
        const name = String((vv.name ?? vv.label ?? vv.title ?? k) as any);
        const url = typeof vv.url === "string" ? vv.url : undefined;
        return { name, url };
      }
      return { name: String(k), url: val != null ? String(val as any) : undefined };
    });
  }
  // Fallback
  return [{ name: String(v) }];
}

function dedupeByName(list: ItemLink[]): ItemLink[] {
  const seen = new Set<string>();
  const out: ItemLink[] = [];
  for (const it of list) {
    const key = it.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export default function CountryClient({ iso }: { iso: string }) {
  const search = useSearchParams();
  const view = (search.get("view") ?? "overview").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<RegistryItem | null>(null);
  const [source, setSource] = useState<string>("");

  const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL as string | undefined;

  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data: Registry | null = null;
        if (REGISTRY_URL) {
          const r = await fetch(REGISTRY_URL, { signal: ac.signal, cache: "no-store" });
          if (r.ok) {
            data = (await r.json()) as Registry;
            setSource("GitHub (NEXT_PUBLIC_REGISTRY_URL)");
          }
        }
        if (!data) {
          const r2 = await fetch("/api/registry", { signal: ac.signal, cache: "no-store" });
          if (r2.ok) {
            data = (await r2.json()) as Registry;
            setSource("/api/registry");
          }
        }
        if (!data?.items?.length) throw new Error("Registry is empty");
        const found = data.items.find(i => (i.country || "").toUpperCase() === iso.toUpperCase()) ?? null;
        console.log("[CountryClient] entry for", iso, found);
        setEntry(found);
      } catch (e: any) {
        setError(e?.message || "Failed to load registry");
        setEntry(null);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ac.abort();
  }, [iso, REGISTRY_URL]);

  const regulators = useMemo(() => dedupeByName(normalizeLinks(entry?.regulators)), [entry]);
  const pros = useMemo(() => dedupeByName(normalizeLinks(entry?.pros)), [entry]);

  if (loading) {
    return <div className={styles.countryWrap}><div className={styles.skeleton}>Loading country…</div></div>;
  }
  if (error) {
    return (
      <div className={styles.countryWrap}>
        <div className={styles.errorBox}>
          <div className={styles.errorTitle}>Couldn’t render this country</div>
          <div className={styles.errorMsg}>{error}</div>
          <div className={styles.errorHelp}>Check your NEXT_PUBLIC_REGISTRY_URL or /api/registry response.</div>
        </div>
      </div>
    );
  }
  if (!entry) {
    return (
      <div className={styles.countryWrap}>
        <div className={styles.errorBox}>
          <div className={styles.errorTitle}>No data for {iso}</div>
          <div className={styles.errorHelp}>This ISO isn’t present in the registry yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.countryWrap}>
      <header className={styles.countryHeader}>
        <div className={styles.countryCode}>{iso}</div>
        <p className={styles.countrySub}>Live overview, regulators, PROs, reporting & fees</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>Source: {source || "unknown"}</span>
          <span className={styles.metaItem}>Regulators: {regulators.length}</span>
          <span className={styles.metaItem}>PROs: {pros.length}</span>
        </div>
        <nav className={styles.pillTabs}>
          <Link className={`${styles.pillTab} ${view === "overview" ? styles.active : ""}`} href={`?view=overview`}>Overview</Link>
          <Link className={`${styles.pillTab} ${view === "regulators" ? styles.active : ""}`} href={`?view=regulators`}>Regulators</Link>
          <Link className={`${styles.pillTab} ${view === "pros" ? styles.active : ""}`} href={`?view=pros`}>PROs</Link>
          <Link className={`${styles.pillTab} ${view === "reporting" ? styles.active : ""}`} href={`?view=reporting`}>Reporting</Link>
          <Link className={`${styles.pillTab} ${view === "fees" ? styles.active : ""}`} href={`?view=fees`}>Fees</Link>
        </nav>
      </header>

      {view === "overview" && (
        <div className={styles.overviewGrid}>
          <div className={styles.card}><div className={styles.cardLabel}>Status</div><div className={styles.cardValue}>active</div></div>
          <div className={styles.card}><div className={styles.cardLabel}>Scope</div><div className={styles.cardValue}>Packaging</div></div>
          <div className={styles.card}><div className={styles.cardLabel}>Producer Register</div><a className={styles.cardLink} href="#" onClick={(e) => e.preventDefault()}>Open register ↗</a></div>
        </div>
      )}

      {view === "regulators" && (
        <Section title={`Regulators (${regulators.length})`}>
          {regulators.length === 0 ? (
            <div className={styles.empty}>No regulators in the registry yet.</div>
          ) : (
            <div className={styles.chips}>
              {regulators.map((r, i) => <ChipLink key={i} name={r.name} url={r.url} />)}
            </div>
          )}
        </Section>
      )}

      {view === "pros" && (
        <Section title={`Producer Responsibility Organisations (PROs) (${pros.length})`}>
          {pros.length === 0 ? (
            <div className={styles.empty}>No PROs in the registry yet.</div>
          ) : (
            <div className={styles.chips}>
              {pros.map((p, i) => <ChipLink key={i} name={p.name} url={p.url} />)}
            </div>
          )}
        </Section>
      )}

      {view === "reporting" && (
        <Section title="Reporting">
          <div className={styles.empty}>Coming soon.</div>
        </Section>
      )}

      {view === "fees" && (
        <Section title="Fees">
          <div className={styles.empty}>Use the <Link href="/tools/fee-calculator">Fee Calculator</Link> for material rates by country.</div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function ChipLink({ name, url }: { name: string; url?: string }) {
  if (!url) return <div className={`${styles.linkChip} ${styles.disabled}`}>{name}</div>;
  return (
    <a className={styles.linkChip} href={url} target="_blank" rel="noopener noreferrer">
      <span className={styles.chipDot} />
      {name}
      <span className={styles.chipExternal} aria-hidden>↗</span>
    </a>
  );
}
