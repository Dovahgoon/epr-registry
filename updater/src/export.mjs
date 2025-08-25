import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const URL  = process.env.SUPABASE_URL;
const SRV  = process.env.SUPABASE_SERVICE_ROLE;   // server-only
const BUCK = process.env.REGISTRY_BUCKET || 'public_';

if (!URL)  throw new Error('Missing SUPABASE_URL');
if (!SRV)  throw new Error('Missing SUPABASE_SERVICE_ROLE');

async function fetchRegistryJson(include_empty = true) {
  // use service role to call RPC (works without extra grants)
  const r = await fetch(`${URL}/rest/v1/rpc/registry_json`, {
    method: 'POST',
    headers: {
      apikey: SRV,
      Authorization: `Bearer ${SRV}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ include_empty }),
  });
  if (!r.ok) throw new Error(`registry_json RPC failed: ${r.status} — ${await r.text()}`);
  return r.json();
}

async function uploadToStorage(path, content) {
  const sb = createClient(URL, SRV, { auth: { persistSession: false } });
  const { error } = await sb.storage.from(BUCK).upload(path, content, {
    contentType: 'application/json',
    upsert: true,
  });
  if (error) throw error;
}

(async () => {
  const json = await fetchRegistryJson(true);
  await fs.mkdir('out', { recursive: true });
  const body = JSON.stringify(json, null, 2);
  await fs.writeFile('out/registry.json', body, 'utf8');
  console.log('Wrote out/registry.json');

  const path = 'registry/registry.json';
  await uploadToStorage(path, body);
  console.log(`Uploaded to Storage: ${path}`);

  const publicUrl = `${URL}/storage/v1/object/public/${BUCK}/${path}`;
  console.log('Public URL:', publicUrl);
})().catch((e) => { console.error(e); process.exit(1); });
