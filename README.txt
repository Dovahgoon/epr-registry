Fix Pack 19.1 – Hardened updater for PRO lists (Top 5: DE, FR, IT, ES, NL)
---------------------------------------------------------------------------
What's new
- Retries + 20s timeout per request, and better error messages.
- Safer FR sources (org sites) to avoid DNS issues.
- Offline mode: set SKIP_SCRAPE=1 to skip network and just keep baseline lists.
- Baseline PROs included so your pages render even if scraping fails.

Usage
1) Extract into your repo root (overwriting the previous Fix Pack 19 files).
2) Install once:  npm i cheerio node-fetch@3
3) Run:
   node scripts/update-pros.mjs
   npm run build
4) If you're behind a firewall/DNS issue:
   set SKIP_SCRAPE=1 and run again to use the baseline data:
     # PowerShell
     $env:SKIP_SCRAPE="1"; node scripts/update-pros.mjs
     npm run build

GitHub Action
- Included workflow runs weekly and opens a PR with any changes.
