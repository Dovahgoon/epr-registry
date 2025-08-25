
// src/app/api/debug-data/route.ts
import { getCatalog } from "@/lib/data";

export async function GET() {
  const data = await getCatalog();
  const pick = (arr: any[], n = 3) => arr.slice(0, n);
  return Response.json({
    ok: true,
    counts: {
      countries: data.countries.length,
      pros: data.pros.length,
      rules: data.rules.length,
      consultants: data.consultants.length,
    },
    samples: {
      countries: pick(data.countries),
      pros: pick(data.pros),
      rules: pick(data.rules),
      consultants: pick(data.consultants),
    }
  });
}
