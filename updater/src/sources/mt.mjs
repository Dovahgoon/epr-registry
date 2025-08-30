// updater/src/sources/mt.mjs
export async function fetchMT() {
  return {
    regulators: [
      {"name": "Environment & Resources Authority (ERA)", "url": "https://era.org.mt/"},
    ],
    pros: [
      {"name": "GreenPak", "url": "https://www.greenpak.com.mt/", "scope": "both"},
      {"name": "GreenMT", "url": "https://www.greenmt.com.mt/", "scope": "both"},
    ]
  };
}
