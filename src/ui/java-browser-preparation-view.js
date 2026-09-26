export function renderJavaBrowserPreparation({ id, state = "unavailable" }) {
  if (state !== "unavailable") return "";
  return `<section class="java-browser-preparation" data-java-browser-preparation="unavailable" aria-labelledby="${id}-title">
    <div>
      <p class="eyebrow">실행 환경</p>
      <h2 id="${id}-title">Java 17 실행 환경</h2>
    </div>
    <div class="java-browser-preparation-action">
      <button class="button button--secondary" type="button" disabled aria-describedby="${id}-description">Java 환경 준비</button>
      <p id="${id}-description">브라우저에서 Java를 실행하는 기능을 준비하고 있습니다. 지금은 문제를 읽고 코드를 작성·저장할 수 있습니다.</p>
    </div>
  </section>`;
}
