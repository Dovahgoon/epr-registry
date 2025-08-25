//
// src/app/api/playbooks/template/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const iso = (url.searchParams.get("iso") || "DE").toUpperCase();
  const md = `# ${iso} EPR/PPWR Playbook

**Scope**: Packaging placed on market in ${iso}.  
**Audience**: Legal/Ops

## 1) Register with national register
- Link: https://example-register.${iso.toLowerCase()}
- Required: Company details, tax ID, authorized rep (if non-resident)

## 2) Choose a PRO (system participation)
- Compare fees & SLAs
- Contract + monthly/quarterly reporting

## 3) Labeling & reporting
- Symbols, language, deadlines
- Weights by material: paper/plastic/glass/metal/wood

## 4) Evidence & renewals
- Store registration number, certificate, contract
- Annual renewal before YYYY-MM-DD
`;
  return new Response(md, {
    headers: {
      "content-type": "text/markdown",
      "content-disposition": `attachment; filename="${iso}-playbook.md"`,
    }
  });
}
