export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const JAVASCRIPT_TOKEN_PATTERNS = [
  { type: "comment", expression: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  { type: "string", expression: /"(?:\\[\s\S]|[^"\\\n])*"?/y },
  { type: "string", expression: /'(?:\\[\s\S]|[^'\\\n])*'?/y },
  { type: "string", expression: /`(?:\\[\s\S]|[^`\\])*`?/y },
  {
    type: "keyword",
    expression:
      /\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/y,
  },
  { type: "literal", expression: /\b(?:false|Infinity|NaN|null|true|undefined)\b/y },
  {
    type: "builtin",
    expression:
      /\b(?:Array|Boolean|console|Date|document|Error|fetch|JSON|Map|Math|Number|Object|Promise|RegExp|Set|String|Symbol|window)\b/y,
  },
  {
    type: "number",
    expression:
      /(?:\b0[xX][\dA-Fa-f]+n?\b|\b0[bB][01]+n?\b|\b0[oO][0-7]+n?\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b)/y,
  },
  { type: "function", expression: /[$A-Z_a-z][$\w]*(?=\s*\()/y },
  {
    type: "operator",
    expression: /(?:=>|===|!==|==|!=|<=|>=|\?\?|\?\.|&&|\|\||\+\+|--|\*\*|\+=|-=|\*=|\/=|%=|[+\-*/%!=<>?:&|~^])/y,
  },
];

const JAVA_TOKEN_PATTERNS = [
  { type: "comment", expression: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  { type: "string", expression: /"(?:\\[\s\S]|[^"\\\n])*"?/y },
  { type: "string", expression: /'(?:\\[\s\S]|[^'\\\n])*'?/y },
  { type: "keyword", expression: /@[A-Z_a-z][$\w]*/y },
  {
    type: "keyword",
    expression:
      /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/y,
  },
  { type: "literal", expression: /\b(?:false|null|true)\b/y },
  { type: "builtin", expression: /\b(?:Integer|List|Map|Math|Object|Optional|Set|String|System)\b/y },
  { type: "number", expression: /\b(?:0[xX][\dA-Fa-f]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)[dDfFlL]?\b/y },
  { type: "function", expression: /[$A-Z_a-z][$\w]*(?=\s*\()/y },
  {
    type: "operator",
    expression: /(?:==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|[+\-*/%!=<>?:&|~^])/y,
  },
];

const CSS_TOKEN_PATTERNS = [
  { type: "comment", expression: /\/\*[\s\S]*?(?:\*\/|$)/y },
  { type: "string", expression: /"(?:\\[\s\S]|[^"\\\n])*"?/y },
  { type: "string", expression: /'(?:\\[\s\S]|[^'\\\n])*'?/y },
  { type: "keyword", expression: /@[\w-]+/y },
  { type: "number", expression: /#[\dA-Fa-f]{3,8}\b/y },
  { type: "selector", expression: /(?:[#.][-_A-Z_a-z][\w-]*|::?[\w-]+)/y },
  { type: "property", expression: /(?:--[\w-]+|[-A-Z_a-z][\w-]*)(?=\s*:)/y },
  {
    type: "number",
    expression:
      /(?:\b\d+(?:\.\d+)?|\.\d+)(?:%|ch|cm|deg|dvh|dvw|em|ex|fr|in|mm|ms|pc|pt|px|rem|s|vh|vmax|vmin|vw)?(?![\w-])/y,
  },
  { type: "literal", expression: /!important\b/y },
  { type: "function", expression: /[-A-Z_a-z][\w-]*(?=\s*\()/y },
];

const JSON_TOKEN_PATTERNS = [
  { type: "property", expression: /"(?:\\[\s\S]|[^"\\\n])*"(?=\s*:)/y },
  { type: "string", expression: /"(?:\\[\s\S]|[^"\\\n])*"?/y },
  { type: "literal", expression: /\b(?:false|null|true)\b/y },
  {
    type: "number",
    expression: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y,
  },
];

function appendToken(tokens, type, value) {
  if (!value) return;
  const previous = tokens.at(-1);
  if (previous?.type === type) {
    previous.value += value;
  } else {
    tokens.push({ type, value });
  }
}

function tokenizeWithPatterns(source, patterns) {
  const tokens = [];
  let cursor = 0;
  let plainTextStart = 0;

  while (cursor < source.length) {
    let matchedToken = null;
    for (const pattern of patterns) {
      pattern.expression.lastIndex = cursor;
      const match = pattern.expression.exec(source);
      if (match) {
        matchedToken = { type: pattern.type, value: match[0] };
        break;
      }
    }

    if (!matchedToken) {
      cursor += 1;
      continue;
    }

    appendToken(tokens, null, source.slice(plainTextStart, cursor));
    appendToken(tokens, matchedToken.type, matchedToken.value);
    cursor += matchedToken.value.length;
    plainTextStart = cursor;
  }

  appendToken(tokens, null, source.slice(plainTextStart));
  return tokens;
}

function findClosingHtmlTag(source, tagName, startIndex) {
  const normalizedSource = source.toLocaleLowerCase("en");
  const marker = `</${tagName}`;
  let index = normalizedSource.indexOf(marker, startIndex);

  while (index !== -1) {
    const boundary = normalizedSource[index + marker.length];
    if (boundary === undefined || boundary === ">" || /\s/.test(boundary)) {
      return index;
    }
    index = normalizedSource.indexOf(marker, index + marker.length);
  }

  return source.length;
}

function tokenizeHtml(source, plainTextPatterns = null) {
  const tokens = [];
  let cursor = 0;

  while (cursor < source.length) {
    if (source.startsWith("<!--", cursor)) {
      const commentEnd = source.indexOf("-->", cursor + 4);
      const end = commentEnd === -1 ? source.length : commentEnd + 3;
      appendToken(tokens, "comment", source.slice(cursor, end));
      cursor = end;
      continue;
    }

    const doctype = /^<!doctype\b[^>]*(?:>|$)/i.exec(source.slice(cursor));
    if (doctype) {
      appendToken(tokens, "keyword", doctype[0]);
      cursor += doctype[0].length;
      continue;
    }

    if (source[cursor] !== "<") {
      const nextTag = source.indexOf("<", cursor + 1);
      const end = nextTag === -1 ? source.length : nextTag;
      const plainSource = source.slice(cursor, end);
      if (plainTextPatterns) {
        for (const token of tokenizeWithPatterns(plainSource, plainTextPatterns)) {
          appendToken(tokens, token.type, token.value);
        }
      } else {
        appendToken(tokens, null, plainSource);
      }
      cursor = end;
      continue;
    }

    const closingTag = source[cursor + 1] === "/";
    const nameStart = cursor + (closingTag ? 2 : 1);
    const tagName = /^[A-Z_a-z][\w:-]*/.exec(source.slice(nameStart));
    if (!tagName) {
      appendToken(tokens, null, source[cursor]);
      cursor += 1;
      continue;
    }

    appendToken(tokens, "operator", closingTag ? "</" : "<");
    appendToken(tokens, "tag", tagName[0]);
    cursor = nameStart + tagName[0].length;
    const normalizedTagName = tagName[0].toLocaleLowerCase("en");
    let tagClosed = false;
    let selfClosing = false;

    while (cursor < source.length) {
      if (source.startsWith("/>", cursor)) {
        appendToken(tokens, "operator", "/>");
        cursor += 2;
        tagClosed = true;
        selfClosing = true;
        break;
      }
      if (source[cursor] === ">") {
        appendToken(tokens, "operator", ">");
        cursor += 1;
        tagClosed = true;
        break;
      }

      const whitespace = /^\s+/.exec(source.slice(cursor));
      if (whitespace) {
        appendToken(tokens, null, whitespace[0]);
        cursor += whitespace[0].length;
        continue;
      }

      const attribute = /^[^\s=/>]+/.exec(source.slice(cursor));
      if (!attribute) {
        appendToken(tokens, null, source[cursor]);
        cursor += 1;
        continue;
      }
      appendToken(tokens, "property", attribute[0]);
      cursor += attribute[0].length;

      const spaceBeforeEquals = /^\s+/.exec(source.slice(cursor));
      if (spaceBeforeEquals) {
        appendToken(tokens, null, spaceBeforeEquals[0]);
        cursor += spaceBeforeEquals[0].length;
      }
      if (source[cursor] !== "=") continue;

      appendToken(tokens, "operator", "=");
      cursor += 1;
      const spaceAfterEquals = /^\s+/.exec(source.slice(cursor));
      if (spaceAfterEquals) {
        appendToken(tokens, null, spaceAfterEquals[0]);
        cursor += spaceAfterEquals[0].length;
      }

      const quote = source[cursor];
      if (quote === '"' || quote === "'") {
        const valueEnd = source.indexOf(quote, cursor + 1);
        const end = valueEnd === -1 ? source.length : valueEnd + 1;
        appendToken(tokens, "string", source.slice(cursor, end));
        cursor = end;
        continue;
      }

      const unquotedValue = /^[^\s>]+/.exec(source.slice(cursor));
      if (unquotedValue) {
        appendToken(tokens, "string", unquotedValue[0]);
        cursor += unquotedValue[0].length;
      }
    }

    if (!closingTag && tagClosed && !selfClosing) {
      const embeddedPatterns =
        normalizedTagName === "script"
          ? JAVASCRIPT_TOKEN_PATTERNS
          : normalizedTagName === "style"
            ? CSS_TOKEN_PATTERNS
            : null;
      if (embeddedPatterns) {
        const contentEnd = findClosingHtmlTag(source, normalizedTagName, cursor);
        const embeddedSource = source.slice(cursor, contentEnd);
        for (const token of tokenizeWithPatterns(embeddedSource, embeddedPatterns)) {
          appendToken(tokens, token.type, token.value);
        }
        cursor = contentEnd;
      }
    }
  }

  return tokens;
}

function codeTokens(source, language) {
  const normalizedLanguage = String(language).toLocaleLowerCase("en");
  if (normalizedLanguage === "html") return tokenizeHtml(source);
  if (normalizedLanguage === "html-javascript") {
    return tokenizeHtml(source, JAVASCRIPT_TOKEN_PATTERNS);
  }
  if (normalizedLanguage === "html-css") {
    return tokenizeHtml(source, CSS_TOKEN_PATTERNS);
  }
  if (normalizedLanguage === "javascript" || normalizedLanguage === "js") {
    return tokenizeWithPatterns(source, JAVASCRIPT_TOKEN_PATTERNS);
  }
  if (normalizedLanguage === "css") {
    return tokenizeWithPatterns(source, CSS_TOKEN_PATTERNS);
  }
  if (normalizedLanguage === "java") {
    return tokenizeWithPatterns(source, JAVA_TOKEN_PATTERNS);
  }
  if (normalizedLanguage === "json") {
    return tokenizeWithPatterns(source, JSON_TOKEN_PATTERNS);
  }
  return [{ type: null, value: source }];
}

export function renderHighlightedCode(source, language) {
  const normalizedSource = String(source);
  const lines = [[]];
  for (const token of codeTokens(normalizedSource, language)) {
    const parts = token.value.split("\n");
    for (const [index, part] of parts.entries()) {
      if (part) {
        const content = escapeHtml(part);
        lines.at(-1).push(
          token.type
            ? `<span class="code-token code-token--${token.type}">${content}</span>`
            : content,
        );
      }
      if (index < parts.length - 1) lines.push([]);
    }
  }

  return lines
    .map((line) => `<span class="code-line">${line.join("")}</span>`)
    .join("\n");
}

function codeSourceAttribute(source) {
  try {
    const encodedSource = encodeURIComponent(source).replace(
      /[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    return ` data-code-source="${escapeHtml(encodedSource)}"`;
  } catch {
    return "";
  }
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
  const text = line.trim();
  const cells = [];
  let cell = "";
  let codeDelimiterLength = 0;
  let endedWithDelimiter = false;
  let index = text.startsWith("|") ? 1 : 0;

  while (index < text.length) {
    const character = text[index];

    if (character === "\\" && text[index + 1] === "|" && codeDelimiterLength === 0) {
      cell += "|";
      endedWithDelimiter = false;
      index += 2;
      continue;
    }

    if (character === "`") {
      let runLength = 1;
      while (text[index + runLength] === "`") runLength += 1;
      if (codeDelimiterLength === 0) codeDelimiterLength = runLength;
      else if (codeDelimiterLength === runLength) codeDelimiterLength = 0;
      cell += "`".repeat(runLength);
      endedWithDelimiter = false;
      index += runLength;
      continue;
    }

    if (character === "|" && codeDelimiterLength === 0) {
      cells.push(cell.trim());
      cell = "";
      endedWithDelimiter = true;
      index += 1;
      continue;
    }

    cell += character;
    endedWithDelimiter = false;
    index += 1;
  }

  if (!endedWithDelimiter || cell) cells.push(cell.trim());
  return cells;
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
      const rawCode = code.join("\n");
      const highlightedCode = renderHighlightedCode(rawCode, language);
      const sourceAttribute = codeSourceAttribute(rawCode);
      output.push(
        `<figure class="code-card"><figcaption><span>${escapeHtml(language)}</span><button class="copy-button" type="button" data-copy-code>코드 복사</button></figcaption><pre class="syntax-code" tabindex="0" aria-label="${escapeHtml(language)} 코드 예제"><code class="language-${escapeHtml(language)}"${sourceAttribute}>${highlightedCode}</code></pre></figure>`,
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
