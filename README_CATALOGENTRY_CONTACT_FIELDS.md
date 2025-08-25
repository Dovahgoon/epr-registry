# Patch: add `url`, `phone`, `address` to CatalogEntry

Fixes TS error in `src/app/pro/[slug]/page.tsx`:
> Property 'url' does not exist on type 'CatalogEntry'.

This updates `src/lib/data.ts` to include optional `url`, `phone`, `address` fields
and adds sample `url`s to demo entries so the page can render links.

Apply then rebuild:
```
rmdir /s /q .next 2>nul
npm run build
```
