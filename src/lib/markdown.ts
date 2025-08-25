
// src/lib/markdown.ts
export function mdToHtml(md: string): string {
  let html = md
    .replace(/\r\n/g, "\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings ###### to #
  html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Bold and italics
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);

  // Inline code `code`
  html = html.replace(/`([^`]+?)`/g, "<code>$1</code>");

  // Unordered lists
  // Wrap consecutive -/ * lines into <ul>
  html = html.replace(/(?:^(?:-|\*) .+\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map(line => line.replace(/^(?:-|\*)\s+/, "")).map(li => `<li>${li}</li>`).join("");
    return `<ul>${items}</ul>`;
  });

  // Paragraphs (lines separated by blank line)
  html = html.replace(/(^|\n)([^\n<][^\n]*)(?=\n|$)/g, (m, p1, p2) => `${p1}<p>${p2}</p>`);

  return html;
}
