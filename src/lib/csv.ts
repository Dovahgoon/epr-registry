
// src/lib/csv.ts
// Minimal CSV parser with delimiter auto-detect (",", ";", or tab) and BOM stripping.

function stripBOM(text: string) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function detectDelimiter(headerLine: string): string {
  // prefer comma, then semicolon, then tab, based on which appears most outside quotes
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = -1;
  for (const delim of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < headerLine.length; i++) {
      const ch = headerLine[i];
      if (ch === '"') {
        const next = headerLine[i + 1];
        if (next === '"') { i++; continue; } // escaped quote
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && ch === delim) count++;
    }
    if (count > bestCount) { bestCount = count; best = delim; }
  }
  return best;
}

export function parseCSV(inputRaw: string): string[][] {
  const input = stripBOM(inputRaw);
  // Grab the first line to detect delimiter
  const firstNL = input.indexOf("\n");
  const headerSample = firstNL === -1 ? input : input.slice(0, firstNL);
  const DELIM = detectDelimiter(headerSample);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < input.length) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = input[i + 1];
        if (next === '"') {
          field += '"'; // escaped quote
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i += 1;
          continue;
        }
      } else {
        field += ch;
        i += 1;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (ch === DELIM) {
        row.push(field);
        field = "";
        i += 1;
        continue;
      }
      if (ch === "\r") { i += 1; continue; } // ignore CR in CRLF
      if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
    }
  }

  row.push(field);
  rows.push(row);
  return rows;
}

export function csvToObjects(csvText: string): Record<string, string>[] {
  const rows = parseCSV(csvText);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => String(h || "").trim());
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // skip totally empty rows
    if (row.every((c) => (c ?? "").trim() === "")) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      const key = header[c] || `col_${c}`;
      obj[key] = String(row[c] ?? "").trim();
    }
    out.push(obj);
  }
  return out;
}
