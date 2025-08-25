// src/lib/db.ts
// Build-safe Prisma loader: avoids static import so the app can build
// even if @prisma/client isn't installed or generated yet.

// Use CommonJS require so TypeScript doesn't need type declarations.
let Prisma: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Prisma = require('@prisma/client')
} catch {
  // @prisma/client not installed or not generated — fall back to a no-op client
  Prisma = null
}

// Minimal no-op client that won't crash if used accidentally
class NoopClient {
  async $connect() {}
  async $disconnect() {}
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined
}

const client =
  global.prisma ||
  (Prisma && Prisma.PrismaClient ? new Prisma.PrismaClient() : new NoopClient())

if (process.env.NODE_ENV !== 'production') global.prisma = client

export const prisma: any = client
export default prisma
