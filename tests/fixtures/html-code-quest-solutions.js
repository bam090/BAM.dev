export const htmlCodeQuestSolutionFixtures = {
  "quest-html-document-structure": {
    referenceSource: `<!doctype html>
<header>
  <p>BAM.dev</p>
  <nav aria-label="학습 목차">
    <a href="#overview">개요</a>
    <a href="#practice">실습</a>
  </nav>
</header>

<main>
  <h1>HTML 학습 기록</h1>
  <section id="overview">
    <h2>오늘의 개념</h2>
    <p>의미 있는 요소로 문서의 역할을 설명합니다.</p>
  </section>
  <section id="practice">
    <h2>직접 해보기</h2>
    <p>작은 문서 구조를 직접 작성합니다.</p>
  </section>
</main>`,
    representativeWrongSolutions: [
      {
        id: "generic-containers-and-heading",
        source: `<div>
  <p>BAM.dev</p>
  <div>학습 목차</div>
</div>
<div>
  <h2>HTML 학습 기록</h2>
  <section><h3>오늘의 개념</h3></section>
</div>`,
        expectedFailingPublicTestIds: [
          "html-structure-doctype-present",
          "html-structure-header-exists",
          "html-structure-labelled-nav",
          "html-structure-single-main",
          "html-structure-primary-heading",
          "html-structure-two-sections",
        ],
      },
    ],
  },
  "quest-html-descriptive-navigation": {
    referenceSource: `<nav aria-label="연습 주제">
  <a data-link="structure" href="#structure">의미 있는 문서 구조 연습</a>
  <a data-link="links" href="#links">설명적인 링크 연습</a>
  <a data-link="forms" href="#forms">접근 가능한 폼 연습</a>
</nav>

<section id="structure">
  <h2>문서 구조</h2>
</section>
<section id="links">
  <h2>링크</h2>
</section>
<section id="forms">
  <h2>폼</h2>
</section>`,
    representativeWrongSolutions: [
      {
        id: "generic-text-and-mismatched-target",
        source: `<nav aria-label="연습 주제">
  <a data-link="structure" href="#structure">보기</a>
  <a data-link="forms" href="#contact">보기</a>
</nav>
<section id="structure"><h2>문서 구조</h2></section>
<section id="contact"><h2>폼</h2></section>`,
        expectedFailingPublicTestIds: [
          "html-navigation-three-links",
          "html-navigation-forms-target",
          "html-navigation-descriptive-form-text",
          "html-navigation-forms-section",
        ],
      },
    ],
  },
  "quest-html-list-data-table": {
    referenceSource: `<ol class="learning-steps">
  <li>개념 읽기</li>
  <li>예제 관찰</li>
  <li>직접 구현</li>
</ol>

<table>
  <caption>주간 학습 시간</caption>
  <thead>
    <tr>
      <th scope="col">요일</th>
      <th scope="col">시간</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">월요일</th>
      <td>30분</td>
    </tr>
    <tr>
      <th scope="row">수요일</th>
      <td>45분</td>
    </tr>
  </tbody>
</table>`,
    representativeWrongSolutions: [
      {
        id: "unordered-list-and-data-cells-only",
        source: `<ul class="learning-steps">
  <li>개념 읽기</li>
  <li>예제 관찰</li>
  <li>직접 구현</li>
</ul>
<table>
  <thead><tr><td>요일</td><td>시간</td></tr></thead>
  <tbody>
    <tr><td>월요일</td><td>30분</td></tr>
    <tr><td>수요일</td><td>45분</td></tr>
  </tbody>
</table>`,
        expectedFailingPublicTestIds: [
          "html-data-three-ordered-steps",
          "html-data-first-step-text",
          "html-data-table-caption",
          "html-data-column-headers",
          "html-data-row-headers",
        ],
      },
    ],
  },
  "quest-html-accessible-form": {
    referenceSource: `<form id="newsletter-signup">
  <label for="email">이메일</label>
  <input id="email" name="email" type="email" autocomplete="email" required>
  <button type="submit">신청하기</button>
</form>`,
    representativeWrongSolutions: [
      {
        id: "unlabelled-text-input",
        source: `<form id="newsletter-signup">
  <span>이메일</span>
  <input id="user" name="user" type="text">
  <button type="button">신청하기</button>
</form>`,
        expectedFailingPublicTestIds: [
          "html-form-email-label",
          "html-form-email-type",
          "html-form-email-name",
          "html-form-email-required",
          "html-form-submit-button",
        ],
      },
    ],
  },
  "quest-html-learning-profile": {
    referenceSource: `<header>
  <nav aria-label="주요 메뉴">
    <a href="#about">소개</a>
    <a href="#study">학습</a>
    <a href="#contact">질문</a>
  </nav>
</header>

<main>
  <article id="about">
    <h1>민지의 학습 프로필</h1>
    <p>HTML로 정보의 의미와 관계를 표현하고 있습니다.</p>
  </article>
  <section id="study">
    <h2>배운 내용</h2>
    <ul>
      <li>문서 구조</li>
      <li>설명적인 링크</li>
      <li>접근 가능한 폼</li>
    </ul>
  </section>
  <section id="contact">
    <h2>질문 남기기</h2>
    <form>
      <label for="question">질문 내용</label>
      <textarea id="question" name="question"></textarea>
      <button type="submit">보내기</button>
    </form>
  </section>
</main>`,
    representativeWrongSolutions: [
      {
        id: "visual-structure-with-missing-relations",
        source: `<header>
  <nav>
    <a href="#profile">소개</a>
    <a href="#study">학습</a>
  </nav>
</header>
<main>
  <section id="profile">
    <h2>민지의 학습 프로필</h2>
  </section>
  <section id="study">
    <h2>배운 내용</h2>
    <ul><li>문서 구조</li><li>링크</li></ul>
  </section>
  <section id="contact">
    <form>
      <label>질문 내용</label>
      <textarea id="question" name="message"></textarea>
    </form>
  </section>
</main>`,
        expectedFailingPublicTestIds: [
          "html-profile-primary-navigation",
          "html-profile-about-article",
          "html-profile-heading-text",
          "html-profile-three-study-items",
          "html-profile-question-label",
          "html-profile-question-name",
        ],
      },
    ],
  },
};
