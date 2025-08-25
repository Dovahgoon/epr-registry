# Fast install playbook

## Option A — PNPM (fastest)
```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install --prefer-offline
pnpm dev
```

## Option B — npm (trimmed)
```bash
npm cache clean --force
npm install --no-audit --no-fund --no-optional --progress=false
npm run dev
```

## Option C — Bun (very fast)
1) Install Bun (https://bun.sh) then:
```bash
bun install
bun dev
```

## Windows tips
- Move project to a short path (e.g., C:\dev\epr)
- Temporarily exclude the project folder from antivirus real-time scanning
- Prefer WSL2 + PNPM for Linux-like filesystem performance