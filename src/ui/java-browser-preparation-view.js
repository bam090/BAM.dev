import { escapeHtml } from "./markdown.js";

export function renderJavaBrowserPreparation({ id, state = "unavailable", message = "", supportMessage = "", compact = false }) {
  const unavailable = state === "unavailable";
  const preparing = state === "preparing";
  const ready = state === "ready";
  const description = unavailable
    ? "브라우저에서 Java를 실행하는 기능을 준비하고 있습니다. 지금은 문제를 읽고 코드를 작성·저장할 수 있습니다."
    : message || "브라우저에서 Java 17 실행 환경을 준비할 수 있습니다. 문제를 읽고 코드를 작성·저장할 수 있습니다.";
  const details = `<p id="${id}-description" data-java-preparation-message role="status" aria-live="polite">${escapeHtml(description)}</p>
      ${supportMessage ? `<p class="java-browser-preparation-support">${escapeHtml(supportMessage)}</p>` : ""}`;
  const compactTitle = ready ? "Java 17 준비 완료" : preparing ? "Java 17 준비 중" : state === "error" ? "Java 17 준비 오류" : "Java 17 준비 필요";
  return `<section class="java-browser-preparation${compact ? " is-compact" : ""}" data-java-browser-preparation="${state}" aria-labelledby="${id}-title">
    <div>
      <p class="eyebrow">실행 환경</p>
      <h2 id="${id}-title">${compact ? compactTitle : "Java 17 실행 환경"}</h2>
    </div>
    <div class="java-browser-preparation-action">
      ${ready ? '<span class="java-browser-preparation-ready">준비 완료</span>' : preparing
        ? '<button class="button button--secondary" type="button" data-java-prepare-cancel>준비 취소</button>'
        : `<button class="button button--secondary" type="button" data-java-prepare${unavailable ? " disabled" : ""} aria-describedby="${id}-description">Java 환경 준비${state === "error" ? " 다시 시도" : ""}</button>`}
      ${compact && (ready || unavailable || state === "idle") ? `<details class="java-browser-preparation-details"><summary>환경 안내</summary>${details}</details>` : details}
    </div>
  </section>`;
}
