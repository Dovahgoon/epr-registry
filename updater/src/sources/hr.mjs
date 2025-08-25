const REG_SOURCE = 'https://www.fzoeu.hr/'; // FZOEU – Environmental Protection & Energy Efficiency Fund

export async function fetchHR() {
  const regulators = [{
    name: 'FZOEU – Environmental Protection & Energy Efficiency Fund',
    role: 'authority',
    url: REG_SOURCE,
    sourceUrl: REG_SOURCE,
  }];
  const pros = []; // fill when list available
  return { regulators, pros };
}
