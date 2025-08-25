import 'dotenv/config';

/**
 * Minimal Supabase helpers using fetch (RPC) and supabase-js (Storage upload).
 * NOTE: Service Role key must be used only on a server/job environment.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
if (!SERVICE_KEY)  console.warn('[WARN] SUPABASE_SERVICE_ROLE missing – RPC upserts will fail.');

export async function callRpc(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC ${fn} failed: ${res.status} ${res.statusText} — ${text}`);
  }
  // functions return void; we don't parse JSON
}

export function supabaseClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export async function uploadToStorage(path, content, {contentType='application/json'}={}) {
  const sb = supabaseClient();
  const [bucket, ...rest] = (process.env.REGISTRY_BUCKET || 'public').split('/', 1);
  const fullPath = path;
  const { data, error } = await sb.storage.from(bucket).upload(fullPath, content, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return data;
}
