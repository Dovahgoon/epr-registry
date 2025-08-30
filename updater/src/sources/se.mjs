const REG_SOURCE = 'https://www.naturvardsverket.se/';

export async function fetchSE() {
  const regulators = [{
    name: 'Naturvårdsverket (Swedish EPA)',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];
  const pros = [];
  return { regulators, pros };
}
