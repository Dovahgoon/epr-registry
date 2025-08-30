// updater/src/export.mjs
import 'dotenv/config';
import { sb, callRpc } from './lib/supabase.mjs';

const BUCKET = process.env.SUPABASE_BUCKET || 'public_';
const PATH = process.env.SUPABASE_REGISTRY_PATH || 'registry/registry.json';

async function fetchViaRPC() {
  // Prefer the DB-side aggregator if available
  const data = await callRpc('registry_json', {}, sb);
  if (!data) throw new Error('registry_json returned empty');
  return data;
}

async function fetchDirect() {
  const [countries, regulators, pros, schemes, rates] = await Promise.all([
    sb.from('Country').select('id, iso2, name').order('name'),
    sb.from('Regulator').select('id, countryId, name, role, url, sourceUrl, lastVerifiedAt'),
    sb.from('Pro').select('id, countryId, name, url, sourceUrl, lastVerifiedAt, scope, materials'),
    sb.from('TariffScheme').select('id, countryId, proId, name, stream, effectiveFrom, effectiveTo, sourceUrl'),
    sb.from('v_tariff_latest').select('id, schemeId, material, packagingType, rate, currency, unit, sourceUrl'),
  ]);

  for (const [label, res] of [
    ['countries', countries],
    ['regulators', regulators],
    ['pros', pros],
    ['schemes', schemes],
    ['rates', rates],
  ]) {
    if (res.error) throw new Error(`${label} select failed: ${res.error.message}`);
  }

  const tariffs = (schemes.data || []).map(s => ({
    ...s,
    rates: (rates.data || []).filter(r => r.schemeId === s.id),
  }));

  return {
    generatedAt: new Date().toISOString(),
    countries: countries.data || [],
    regulators: regulators.data || [],
    pros: pros.data || [],
    tariffs,
  };
}

function ensureShape(obj) {
  if (obj && Array.isArray(obj.countries) && Array.isArray(obj.pros)) {
    return obj.tariffs ? obj : { ...obj, tariffs: obj.tariffs || [] };
  }
  return {
    generatedAt: obj.generatedAt || obj.generated_at || new Date().toISOString(),
    countries: obj.countries || obj.Country || obj.data?.countries || obj.data?.Country || [],
    pros: obj.pros || obj.Pro || obj.data?.pros || obj.data?.Pro || [],
    regulators: obj.regulators || obj.Regulator || obj.data?.regulators || obj.data?.Regulator || [],
    tariffs: obj.tariffs || obj.data?.tariffs || [],
  };
}

async function uploadToStorage(jsonObj) {
  const body = Buffer.from(JSON.stringify(jsonObj, null, 2));
  const { error } = await sb.storage.from(BUCKET).upload(PATH, body, {
    contentType: 'application/json',
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(PATH);
  return urlData.publicUrl;
}

(async () => {
  try {
    let registry;
    try {
      registry = await fetchViaRPC();
    } catch (e) {
      console.warn(
        '[export] RPC registry_json not available or failed, falling back to direct selects. Details:',
        e.message || e
      );
      registry = await fetchDirect();
    }
    const final = ensureShape(registry);
    const publicUrl = await uploadToStorage(final);
    console.log('[export] Uploaded JSON to:', publicUrl);
    console.log('[export] Summary:', {
      countries: final.countries?.length || 0,
      pros: final.pros?.length || 0,
      regulators: final.regulators?.length || 0,
      tariffs: final.tariffs?.length || 0,
      generatedAt: final.generatedAt,
    });
  } catch (err) {
    console.error('[export] Failed:', err.message || err);
    process.exit(1);
  }
})();
