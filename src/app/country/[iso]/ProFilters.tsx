'use client';

import * as React from 'react';

/** Scopes we support in the UI */
export type Scope = 'household' | 'commercial' | 'both' | 'unknown';

/** State object shared between the hook, filters UI, and the page */
export type ProFiltersState = {
  q: string;
  materials: Set<string>;
  scopes: Set<Scope>;
  setQ: (v: string) => void;
  setMaterials: (v: Set<string>) => void;
  setScopes: (v: Set<Scope>) => void;
};

/** Hook: holds query, materials, and scope selections */
export function useProFilters(): ProFiltersState {
  const [q, setQ] = React.useState('');
  const [materials, setMaterials] = React.useState<Set<string>>(new Set());
  const [scopes, setScopes] = React.useState<Set<Scope>>(new Set()); // empty = “all” (page will expand to ALL)

  return { q, materials, scopes, setQ, setMaterials, setScopes };
}

/** Helper: does the actual filtering based on the current state */
export function applyFilters<T extends { name?: string; materials?: string[]; scope?: Scope }>(
  pros: T[],
  state: ProFiltersState
): T[] {
  const q = state.q.trim().toLowerCase();
  const hasQ = q.length > 0;
  const wantMaterials = state.materials;
  const wantScopes = state.scopes;

  const scopeMatches = (proScopeRaw: Scope | undefined | null) => {
    const proScope = (proScopeRaw ?? 'unknown') as Scope;

    // If caller passes an empty set, the page treats it as “ALL scopes”
    if (wantScopes.size === 0) return true;

    // Matching logic: “both” should match either HH/Commercial selections too
    if (proScope === 'both') {
      return (
        wantScopes.has('both') ||
        wantScopes.has('household') ||
        wantScopes.has('commercial')
      );
    }
    if (proScope === 'household') {
      return wantScopes.has('household') || wantScopes.has('both');
    }
    if (proScope === 'commercial') {
      return wantScopes.has('commercial') || wantScopes.has('both');
    }
    // unknown
    return wantScopes.has('unknown');
  };

  return pros.filter((p) => {
    if (!scopeMatches(p.scope)) return false;

    if (hasQ) {
      const name = (p.name ?? '').toLowerCase();
      if (!name.includes(q)) return false;
    }

    if (wantMaterials.size > 0) {
      const mats = (p.materials ?? []).map((m) => (m || '').toLowerCase());
      const any = mats.some((m) => wantMaterials.has(m));
      if (!any) return false;
    }

    return true;
  });
}

/** UI component: Result count, search, scope chips, (optional) material chips, and Clear */
export function ProFilters({
  allMaterials = [],
  state,
  resultCount,
  onClear,
}: {
  allMaterials?: string[];
  state: ProFiltersState;
  resultCount: number;
  onClear: () => void;
}) {
  const scopes: Scope[] = ['household', 'commercial', 'both', 'unknown'];

  const toggleScope = (s: Scope) => {
    const next = new Set(state.scopes);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    // Let the page decide what to do with empty (it expands to ALL)
    state.setScopes(next);
  };

  const toggleMaterial = (m: string) => {
    const key = (m || '').toLowerCase();
    const next = new Set(state.materials);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    state.setMaterials(next);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-white/70">
          <span className="font-medium text-white">Results:</span> {resultCount}
          <span className="mx-2">|</span>
          <button
            onClick={onClear}
            className="text-violet-300 hover:text-violet-200 underline underline-offset-4"
          >
            Clear
          </button>
        </div>

        <input
          value={state.q}
          onChange={(e) => state.setQ(e.target.value)}
          placeholder="Search PRO name…"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-white/50">Purpose</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {scopes.map((s) => {
            const active = state.scopes.has(s);
            return (
              <button
                key={s}
                onClick={() => toggleScope(s)}
                className={[
                  'rounded-full px-3 py-1 text-sm',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15',
                ].join(' ')}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {allMaterials.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-white/50">Materials</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {allMaterials.map((m) => {
              const key = (m || '').toLowerCase();
              const active = state.materials.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleMaterial(key)}
                  className={[
                    'rounded-full px-3 py-1 text-sm',
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/15',
                  ].join(' ')}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProFilters;
