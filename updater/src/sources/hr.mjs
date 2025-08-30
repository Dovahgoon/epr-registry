const REG_SOURCE = 'https://www.fzoeu.hr/';

export async function fetchHR() {
  const regulators = [{
    name: 'FZOEU – Environmental Protection & Energy Efficiency Fund',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];
  const pros = [];
  return { regulators, pros };
}
