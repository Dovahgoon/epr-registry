# Registry Updater (Starter)

This job ingests official sources for each country, *upserts* Regulators & PROs to Supabase via RPC, and can export `registry.json` for your app.

## Setup

1. Copy `.env.example` to `.env` and fill:
```
SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE=...    # server-side only
SUPABASE_ANON_KEY=...        # optional for exporter
REGISTRY_BUCKET=public       # optional
```
2. Install:
```
npm i
```

## Run the updater

- All supported countries:
```
node src/main.mjs --all
```

- Single country:
```
node src/main.mjs --country DE
```

## Export JSON

```
node src/export.mjs
```

This calls the RPC `registry_json` and writes `out/registry.json`

## Add new countries

Add a new file in `src/sources/<iso>.mjs` that exports an async function `fetch<ISO>()` returning:
```js
{ regulators: [{name, role:'register'|'authority'|'ministry', url, sourceUrl}], pros: [{name, url, sourceUrl}] }
```
Register it in `countryFetchers` inside `src/main.mjs`.
