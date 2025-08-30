// updater/src/lib/supabase.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const KEY =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  // Service role is REQUIRED for upserts from CI
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.');
}

// Single shared client (use this everywhere)
export const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Map overloaded / ambiguous RPC names to unique wrappers
const RPC_NAME_MAP = new Map([
  ['upsert_pro', 'upsert_pro_api'], // avoid PostgREST 300 ambiguity
]);

let loggedOnce = false;

/**
 * Call a Postgres RPC function through supabase-js.
 * - Automatically remaps ambiguous names (e.g., upsert_pro → upsert_pro_api)
 * - Optional custom client argument for advanced cases (defaults to shared `sb`)
 */
export async function callRpc(fnName, payload = {}, client = sb) {
  const mapped = RPC_NAME_MAP.get(fnName) || fnName;

  // Helpful log (once) to verify mapping in CI logs
  if (!loggedOnce && RPC_NAME_MAP.has(fnName)) {
    console.log(`[rpc-map] ${fnName} -> ${mapped}`);
    loggedOnce = true;
  }

  // Guard: if someone tries to call the ambiguous name directly without a map
  if (fnName === 'upsert_pro' && mapped === 'upsert_pro') {
    throw new Error('Guard: do not call `upsert_pro` directly; use `upsert_pro_api`.');
  }

  const { data, error } = await client.rpc(mapped, payload);
  if (error) {
    // Surface full context for debugging in CI
    const where = client === sb ? 'default-client' : 'custom-client';
    throw new Error(`[rpc:${mapped} via ${where}] ${error.message}`);
  }
  return data;
}
