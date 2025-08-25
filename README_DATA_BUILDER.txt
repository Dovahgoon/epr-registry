# Data Builder Pack — EPR / PPWR Directory

This pack lets you edit **CSVs** in `/data/` and auto-generate the typed runtime
files in `/src/data/` for the app.

## Files included
- `data/countries_enriched.csv` — 39 countries (EU27 + UK + EEA/EFTA + WB + CH/AD)
- `data/pros.csv` — sample PRO rows
- `scripts/build-data.mjs` — CSV → TS generator
- `src/types/data.ts` — shared types (optional)

## Setup
1. Copy this folder into your project **root** so paths match:
   - `data/`
   - `scripts/build-data.mjs`
   - `src/types/`

2. Add NPM scripts in `package.json`:
```json
{
  "scripts": {
    "build:data": "node scripts/build-data.mjs",
    "prebuild": "npm run build:data",
    "dev": "next dev",
    "build": "next build"
  }
}
```

3. Run once:
```bash
npm run build:data
```

This writes:
- `src/data/countries.ts` (default export array)
- `src/data/countryDetails.json` (mergeable store)
- `src/data/countryDetails.ts` (TS module app imports)

> The generator **merges** PROs from `data/pros.csv` into `countryDetails.*`
> and creates empty stubs for any ISO2 missing from the JSON.

## Editing workflow
- Keep editing `data/countries_enriched.csv` and `data/pros.csv`.
- Run `npm run build:data` (or just `npm run build` since we hook `prebuild`).

## Notes
- The CSV parser here is minimal but supports quotes and commas.
- `slug` defaults to lowercased ISO2 if blank.
- PRO duplicates by name are deduped per country.
