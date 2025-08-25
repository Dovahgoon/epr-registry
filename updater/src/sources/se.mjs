const REG_SOURCE = 'https://www.naturvardsverket.se/'; // Naturvårdsverket

export async function fetchSE() {
  const regulators = [{
    name: 'Naturvårdsverket (Swedish EPA)',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];
  const pros = []; // fill when list available
  return { regulators, pros };
}
