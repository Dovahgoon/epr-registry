// lib/server/loadCatalog.ts
import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Reads a JSON catalog from /data/catalog.json on the server.
 * Usage in a Server Component:
 *   const data = await loadCatalog();
 */
export async function loadCatalog() {
  const filePath = path.join(process.cwd(), 'data', 'catalog.json');
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}
