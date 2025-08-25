# EPR Tariffs Auto-Updater (Skeleton)

This provides a **scheduled weekly updater** that fetches official tariff pages (HTML/PDF), parses rates, and writes
`data/tariffs-YYYY.json`. It opens an auto commit if the JSON changed.

## How it works
- Config: `config/sources.json` (list of country schemes to watch).
- Parsers: `src/parsers/*.js` (one per source). Each exports `parse(html)` or `parse(buffer)` and returns:
  ```js
  {
    countryName: 'Italy',
    scheme: {
      id: 'conai',
      name: 'CONAI – Environmental Contribution (CAC)',
      effectiveFrom: '2025-01-01',
      sourceUrl: '...',
      materials: { paper: 0.065, glass: 0.015, steel: 0.005, aluminum: 0.012, wood: 0.007 },
      plastic: { label: 'Plastic', subMaterials: [{ code, label, rate }, ...] }
    }
  }
  ```
- Script: `scripts/update-tariffs.mjs` fetches and merges into `data/tariffs-2025.json`.
- CI: `.github/workflows/update-tariffs.yml` runs weekly (Mon 06:00 UTC).

## Use locally
```bash
npm i
npm run update:tariffs
```

## Wire to your app
Point your calculator to `data/tariffs-2025.json` (already supported in the previous live-rates patch).

## Notes
- **Legal:** Respect robots.txt and each site’s terms. If a site disallows scraping, switch to manual upload or official API/data files.
- **Germany:** fees vary by dual-system provider; track chosen providers individually or leave DE out of public table.
- **Mid-year changes:** When schemes publish new tables, the next cron will commit an updated JSON. You can increase the schedule to daily if needed.
