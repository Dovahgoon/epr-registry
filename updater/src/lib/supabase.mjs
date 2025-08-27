// updater/src/lib/supabase.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL  = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.');
}

export const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Map overloaded/ambiguous RPC names to unique wrappers
const RPC_NAME_MAP = new Map([
  ['upsert_pro', 'upsert_pro_api'], // avoid PGRST203 ambiguity
]);

let loggedOnce = false;

export async function callRpc(fnName, payload = {}) {
  const mapped = RPC_NAME_MAP.get(fnName) || fnName;
  if (!loggedOnce && RPC_NAME_MAP.has(fnName)) {
    console.log(`[rpc-map] ${fnName} → ${mapped}`);
    loggedOnce = true;
  }
  const { data, error } = await sb.rpc(mapped, payload);
  if (error) throw error;
  return data;
}
