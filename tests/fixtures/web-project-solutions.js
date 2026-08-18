export const webProjectSolutionFixtures = {
  "web-project-responsive-learning-plan": {
    referenceFiles: [
      {
        path: "index.html",
        source: `<!doctype html>
<header class="site-header">
  <p class="site-title">나의 개발 학습</p>
  <nav aria-label="학습 메뉴">
    <a href="#plan">이번 주 계획</a>
  </nav>
</header>

<main id="plan">
  <h1>이번 주 학습 계획</h1>
  <section class="learning-board" aria-label="언어별 학습 계획">
    <article class="learning-card" id="html-plan">
      <h2>HTML</h2>
      <p>의미 있는 구조를 복습합니다.</p>
      <progress aria-label="HTML 학습 진도" value="3" max="5">3/5</progress>
      <a class="learning-card-link" href="#html-plan">HTML 계획 보기</a>
    </article>
    <article class="learning-card" id="css-plan">
      <h2>CSS</h2>
      <p>Grid와 반응형 배치를 연습합니다.</p>
      <progress aria-label="CSS 학습 진도" value="2" max="5">2/5</progress>
      <a class="learning-card-link" href="#css-plan">CSS 계획 보기</a>
    </article>
    <article class="learning-card" id="javascript-plan">
      <h2>JavaScript</h2>
      <p>데이터 흐름과 함수를 복습합니다.</p>
      <progress aria-label="JavaScript 학습 진도" value="4" max="5">4/5</progress>
      <a class="learning-card-link" href="#javascript-plan">JavaScript 계획 보기</a>
    </article>
  </section>
</main>`,
      },
      {
        path: "styles.css",
        source: `:root {
  color-scheme: light;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  color: #172033;
  background-color: #f8fafc;
}

.site-header,
main {
  width: min(100% - 32px, 960px);
  margin-inline: auto;
}

.learning-board {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.learning-card {
  padding: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background-color: #ffffff;
}

.learning-card-link:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

@media (min-width: 48rem) {
  .learning-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}`,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "generic-incomplete-structure",
        files: [
          {
            path: "index.html",
            source: `<header>
  <p>나의 개발 학습</p>
  <nav><a href="#plan">이번 주 계획</a></nav>
</header>
<div id="plan">
  <h1>학습 기록</h1>
  <section class="learning-board">
    <article class="learning-card">
      <h2>문서 구조</h2>
      <progress value="1" max="5">1/5</progress>
    </article>
    <article class="learning-card">
      <h2>스타일 구조</h2>
    </article>
  </section>
</div>`,
          },
          {
            path: "styles.css",
            source: webProjectReferenceCss(),
          },
        ],
        expectedFailingAutomaticCriterionIds: [
          "auto-html-doctype",
          "auto-html-labelled-nav",
          "auto-html-main",
          "auto-html-heading",
          "auto-html-three-cards",
          "auto-html-progress-label",
          "auto-html-learning-links",
          "auto-html-card-headings",
          "auto-html-card-html-name",
          "auto-html-card-css-name",
          "auto-html-card-javascript-name",
        ],
      },
      {
        id: "fixed-two-column-layout",
        files: [
          {
            path: "index.html",
            source: webProjectReferenceHtml(),
          },
          {
            path: "styles.css",
            source: `.learning-board {
  display: flex;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.learning-card:focus {
  outline: 1px solid #2563eb;
}`,
          },
        ],
        expectedFailingAutomaticCriterionIds: [
          "auto-css-grid",
          "auto-css-gap",
          "auto-css-mobile-column",
          "auto-css-wide-columns",
          "auto-css-focus",
        ],
      },
    ],
  },
};

function webProjectReferenceHtml() {
  return `<!doctype html>
<header class="site-header">
  <p class="site-title">나의 개발 학습</p>
  <nav aria-label="학습 메뉴">
    <a href="#plan">이번 주 계획</a>
  </nav>
</header>

<main id="plan">
  <h1>이번 주 학습 계획</h1>
  <section class="learning-board" aria-label="언어별 학습 계획">
    <article class="learning-card" id="html-plan">
      <h2>HTML</h2>
      <p>의미 있는 구조를 복습합니다.</p>
      <progress aria-label="HTML 학습 진도" value="3" max="5">3/5</progress>
      <a class="learning-card-link" href="#html-plan">HTML 계획 보기</a>
    </article>
    <article class="learning-card" id="css-plan">
      <h2>CSS</h2>
      <p>Grid와 반응형 배치를 연습합니다.</p>
      <progress aria-label="CSS 학습 진도" value="2" max="5">2/5</progress>
      <a class="learning-card-link" href="#css-plan">CSS 계획 보기</a>
    </article>
    <article class="learning-card" id="javascript-plan">
      <h2>JavaScript</h2>
      <p>데이터 흐름과 함수를 복습합니다.</p>
      <progress aria-label="JavaScript 학습 진도" value="4" max="5">4/5</progress>
      <a class="learning-card-link" href="#javascript-plan">JavaScript 계획 보기</a>
    </article>
  </section>
</main>`;
}

function webProjectReferenceCss() {
  return `:root {
  color-scheme: light;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  color: #172033;
  background-color: #f8fafc;
}

.site-header,
main {
  width: min(100% - 32px, 960px);
  margin-inline: auto;
}

.learning-board {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.learning-card {
  padding: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background-color: #ffffff;
}

.learning-card-link:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

@media (min-width: 48rem) {
  .learning-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}`;
}
