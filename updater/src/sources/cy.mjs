// updater/src/sources/cy.mjs
export async function fetchCY() {
  return {
    regulators: [
      {"name": "Department of Environment", "url": "https://www.environment.gov.cy/environment/environment.nsf/index_en/index_en?opendocument"},
    ],
    pros: [
      {"name": "Green Dot Cyprus", "url": "https://www.greendot.com.cy/en/", "scope": "both"},
    ]
  };
}
