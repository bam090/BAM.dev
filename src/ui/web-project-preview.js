import { WEB_CODE_QUEST_EVALUATION_KINDS } from "../core/web-code-quest.js";
import { findWebProjectSourceIssue } from "../core/web-project.js";

const EMPTY_PREVIEW =
  '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; base-uri \'none\'; form-action \'none\'"></head><body></body></html>';

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function createWebProjectPreviewDocument(htmlSource, cssSource) {
  const htmlIssue = findWebProjectSourceIssue(
    WEB_CODE_QUEST_EVALUATION_KINDS.HTML,
    htmlSource,
  );
  if (htmlIssue) {
    return Object.freeze({
      document: EMPTY_PREVIEW,
      issue: Object.freeze({ filePath: "index.html", ...htmlIssue }),
    });
  }

  const cssIssue = findWebProjectSourceIssue(
    WEB_CODE_QUEST_EVALUATION_KINDS.CSS,
    cssSource,
  );
  if (cssIssue) {
    return Object.freeze({
      document: EMPTY_PREVIEW,
      issue: Object.freeze({ filePath: "styles.css", ...cssIssue }),
    });
  }

  const stylesheetUrl = `data:text/css;charset=utf-8,${encodeURIComponent(cssSource)}`;
  const policy = [
    "default-src 'none'",
    "style-src data: 'unsafe-inline'",
    "img-src 'none'",
    "font-src 'none'",
    "connect-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "navigate-to 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  return Object.freeze({
    document: `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${escapeAttribute(policy)}"><link rel="stylesheet" href="${escapeAttribute(stylesheetUrl)}"></head><body>${htmlSource}</body></html>`,
    issue: null,
  });
}
