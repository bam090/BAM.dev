import { escapeHtml } from "./markdown.js";

export function renderJavaBrowserPreparation({ id, state = "unavailable", message = "", supportMessage = "" }) {
  const unavailable = state === "unavailable";
  const preparing = state === "preparing";
  const ready = state === "ready";
  const description = unavailable
    ? "브라우저에서 Java를 실행하는 기능을 준비하고 있습니다. 지금은 문제를 읽고 코드를 작성·저장할 수 있습니다."
    : message || "브라우저에서 Java 17 실행 환경을 준비할 수 있습니다. 문제를 읽고 코드를 작성·저장할 수 있습니다.";
  return `<section class="java-browser-preparation" data-java-browser-preparation="${state}" aria-labelledby="${id}-title">
    <div>
      <p class="eyebrow">실행 환경</p>
      <h2 id="${id}-title">Java 17 실행 환경</h2>
    </div>
    <div class="java-browser-preparation-action">
      ${ready ? '<span class="java-browser-preparation-ready">준비 완료</span>' : preparing
        ? '<button class="button button--secondary" type="button" data-java-prepare-cancel>준비 취소</button>'
        : `<button class="button button--secondary" type="button" data-java-prepare${unavailable ? " disabled" : ""} aria-describedby="${id}-description">Java 환경 준비${state === "error" ? " 다시 시도" : ""}</button>`}
      <p id="${id}-description" data-java-preparation-message role="status" aria-live="polite">${escapeHtml(description)}</p>
      ${supportMessage ? `<p class="java-browser-preparation-support">${escapeHtml(supportMessage)}</p>` : ""}
    </div>
  </section>`;
}
