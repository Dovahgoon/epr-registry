import * as cheerio from 'cheerio';
import { normalizeName, uniqueBy } from '../lib/utils.mjs';

const REG_SOURCE = 'https://mst.dk/';
const PRO_SOURCE = 'https://producerresponsibility.dk/';

export async function fetchDK() {
  const regulators = [{
    name: 'Danish EPA (Miljøstyrelsen)',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];

  const pros = [];
  return { regulators, pros };
}
