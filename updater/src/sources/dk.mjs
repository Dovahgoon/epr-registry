import * as cheerio from 'cheerio';
import { normalizeName, uniqueBy } from '../lib/utils.mjs';

const REG_SOURCE = 'https://mst.dk/'; // Danish EPA
const PRO_SOURCE = 'https://producerresponsibility.dk/';

export async function fetchDK() {
  // Regulator: Danish EPA
  const regulators = [{
    name: 'Danish EPA (Miljøstyrelsen)',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];

  // PROs: packaging PROs in DK (example placeholder; replace with parsed list when source stabilizes)
  // If you have an official list page, implement a cheerio parser here.
  const pros = []; // keep empty if none

  return { regulators, pros };
}
