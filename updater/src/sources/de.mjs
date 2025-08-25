import * as cheerio from 'cheerio';
import { normalizeName, uniqueBy } from '../lib/utils.mjs';

const SOURCE = 'https://www.verpackungsregister.org/en/faq/dual-systems';

export async function fetchDE() {
  const regulators = [{
    name: 'LUCID Register',
    role: 'register',
    url: 'https://www.verpackungsregister.org/',
    sourceUrl: SOURCE,
  }];

  let pros = [];
  try {
    const res = await fetch(SOURCE);
    const html = await res.text();
    const $ = cheerio.load(html);
    // Very loose: collect anchors that look like dual systems (we also keep a safe fallback list)
    $('a[href]').each((_, a) => {
      const name = $(a).text().trim();
      const href = $(a).attr('href');
      if (!name || !href) return;
      if (/dual|system|punkt|interseroh|belland|reclay|noventiz|prezero|veolia|eko/i.test(name)) {
        pros.push({ name: normalizeName(name), url: href.startsWith('http') ? href : `https://www.verpackungsregister.org${href}`, sourceUrl: SOURCE });
      }
    });
  } catch(e) {
    // fall back to static list below
  }

  // Fallback full list (keeps you covered even if scraping fails)
  const fallback = [
    ['Der Grüne Punkt – Duales System Deutschland (DSD)', 'https://www.gruener-punkt.de/'],
    ['Interseroh+ (ALBA Group)', 'https://www.interseroh.plus/'],
    ['BellandVision GmbH', 'https://www.bellandvision.com/'],
    ['Reclay Systems GmbH', 'https://www.reclay-group.com/'],
    ['NOVENTIZ Dual GmbH', 'https://www.noventiz.de/'],
    ['PreZero Dual GmbH', 'https://www.prezero.com/'],
    ['Veolia Umweltservice Dual GmbH', 'https://www.veolia.de/'],
    ['EKO-PUNKT (REMONDIS Group)', 'https://www.recyclingpoints.de/eko-punkt'],
  ].map(([name,url]) => ({ name, url, sourceUrl: SOURCE }));

  if (pros.length < fallback.length) pros = fallback;

  pros = uniqueBy(pros, x => x.name.toLowerCase());

  return { regulators, pros };
}
