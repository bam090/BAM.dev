export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(rawHref) {
  const href = rawHref.trim();
  if (/^https:\/\//i.test(href) || /^(?:\.\.?\/|\/|#)/.test(href)) {
    return href;
  }
  return "#";
}

function renderInline(rawText) {
  const tokens = [];
  const reserve = (html) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };

  let text = String(rawText);
  text = text.replace(/`([^`]+)`/g, (_, code) => reserve(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeUrl = safeHref(href);
    const isExternal = /^https:\/\//i.test(safeUrl);
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    return reserve(`<a href="${escapeHtml(safeUrl)}"${target}>${escapeHtml(label)}</a>`);
  });

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, "$1<em>$2</em>");

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function headingId(text) {
  return String(text)
    .toLocaleLowerCase("ko")
    .replace(/`/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "") || "section";
}

function isBlockStart(lines, index) {
  const line = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return (
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    /^\s*(?:---+|\*\*\*+)\s*$/.test(line) ||
    (line.trim().startsWith("|") && /^\s*\|?\s*:?-{3,}/.test(next))
  );
}

function splitTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

export function renderMarkdown(markdown, { skipFirstHeading = false } = {}) {
  const lines = String(markdown).replaceAll("\r\n", "\n").split("\n");
  const output = [];
  let index = 0;
  let firstHeadingSkipped = false;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([\w-]*)\s*$/);
    if (fence) {
      const language = fence[1] || "text";
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += index < lines.length ? 1 : 0;
      const escapedCode = escapeHtml(code.join("\n"));
      output.push(
        `<figure class="code-card"><figcaption><span>${escapeHtml(language)}</span><button class="copy-button" type="button" data-copy-code>코드 복사</button></figcaption><pre><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre></figure>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      if (skipFirstHeading && level === 1 && !firstHeadingSkipped) {
        firstHeadingSkipped = true;
      } else {
        output.push(
          `<h${level} id="${escapeHtml(headingId(heading[2]))}">${renderInline(heading[2])}</h${level}>`,
        );
      }
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|") && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] ?? "")) {
      const headers = splitTableRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      output.push(
        `<div class="table-scroll" tabindex="0"><table><thead><tr>${headers.map((cell) => `<th scope="col">${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      output.push(`<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      output.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*\d+\.\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      output.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      output.push("<hr>");
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return output.join("\n");
}
