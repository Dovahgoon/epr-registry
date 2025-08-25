# NPM install troubleshooting (MVP)

## 0) Check versions
```bash
node -v   # must be 18.x or 20.x (>=18.17 recommended)
npm -v    # 9 or 10 is fine
```

## 1) Clean and reinstall
**macOS/Linux**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Windows (PowerShell)**
```powershell
rd /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

## 2) If you see `ERESOLVE unable to resolve dependency tree`
- The project includes a `.npmrc` with `legacy-peer-deps=true`. If you still see it, try:
```bash
npm install --legacy-peer-deps
```

## 3) If you see OpenSSL errors (Node 17/Win)
```bash
# Windows PowerShell
setx NODE_OPTIONS "--openssl-legacy-provider"

# macOS/Linux
export NODE_OPTIONS="--openssl-legacy-provider"
```

## 4) If behind a proxy/corporate network
```bash
npm config set proxy http://YOUR_PROXY:PORT
npm config set https-proxy http://YOUR_PROXY:PORT
# As a last resort only:
npm config set strict-ssl false
```

## 5) Windows path length / permissions
- Move project to a short path like `C:\dev\epr`.
- Enable long paths (once, admin PowerShell):
```powershell
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
```

## 6) Try PNPM (fast, reliable)
```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
pnpm dev
```

## 7) Try Yarn (Berry)
```bash
corepack enable
corepack prepare yarn@4.3.1 --activate
yarn install
yarn dev
```

If issues persist, copy the first ~40 lines of the error and we'll pinpoint it.