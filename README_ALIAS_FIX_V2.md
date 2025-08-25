# Alias + Missing Files Fix (v2)

This ensures `@/*` resolves to `src/*` via **jsconfig.json** and a **webpack alias** in `next.config.mjs`,
and re-adds the missing modules so your imports resolve.

## Steps
1) Unzip into your project root (overwrite `jsconfig.json` and `next.config.mjs` if prompted).
2) Make sure the files now exist:
   - src/lib/liveTariffs.ts
   - src/components/ui/select.tsx
   - src/lib/auth.ts
   - src/lib/data.ts
3) Install deps if not done:
   npm i @radix-ui/react-select lucide-react next-auth@^4
4) Build:
   npm run build

If you still get module-not-found, check that your app structure is `src/app/...` (not inside `tariffs-updater/`).
