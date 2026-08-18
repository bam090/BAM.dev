# 05. HTML 복습과 구조 점검

## 학습 목표

- 요구사항을 콘텐츠의 의미 단위로 나누고 코드 작성 전에 문서 구조를 설명할 수 있습니다.
- 문서 구조, 텍스트, 링크, 이미지, 목록, 표, 폼을 하나의 페이지에 연결할 수 있습니다.
- HTML 소스, 브라우저가 만든 DOM, 화면 동작을 서로 다른 관점에서 확인할 수 있습니다.
- HTML 검사기와 키보드 점검이 각각 찾을 수 있는 문제와 한계를 설명할 수 있습니다.
- 서버가 없는 폼에서 HTML이 제공하는 범위와 제공하지 않는 기능을 구분할 수 있습니다.

## 60분 학습 순서

1. 8분: 전체 개념 지도를 자신의 말로 다시 설명합니다.
2. 10분: 요구사항을 영역과 데이터 구조로 나눕니다.
3. 25분: 개발 학습 프로필 문서를 완성합니다.
4. 12분: 소스·DOM·검사기·키보드 관점으로 검증합니다.
5. 5분: 확인 문제와 다음 개선 항목을 기록합니다.

## 전체 복습 지도

```text
HTML의 목적
└─ 콘텐츠의 구조와 의미 표현
   ├─ 문서 뼈대: doctype, html, head, body
   ├─ 구역과 제목: header, nav, main, article, section, aside, footer, h1~h6
   ├─ 텍스트와 이동: p, strong, em, a, href
   ├─ 콘텐츠 구조: img, figure, ul/ol, table
   ├─ 입력: form, label, input, textarea, select, button
   └─ 품질 확인: DOM 관찰, 문법 검사, 키보드와 대체 상황 점검
```

개별 요소 이름을 외우는 것만으로는 충분하지 않습니다. 실제 요구사항을 보고 “이 콘텐츠의 역할은 무엇인가?”, “다른 콘텐츠와 어떤 관계인가?”, “화면을 보거나 마우스를 쓰지 않아도 의미와 기능이 남는가?”라고 질문해야 합니다.

## 코드를 쓰기 전에 구조부터 말하기

“개발 학습 프로필” 페이지 요구사항은 다음과 같습니다.

- 사이트 이름과 주요 메뉴
- 학습자 소개와 프로필 이미지
- 현재 학습 중인 기술 목록
- 주간 학습 일정표
- 질문을 보내는 폼
- 저작권 정보

곧바로 태그를 입력하기 전에 구조를 글로 나눕니다.

```text
header
├─ h1: 사이트 이름
└─ nav: 주요 메뉴
main
├─ article: 학습자 소개
│  ├─ h2
│  ├─ figure
│  └─ p
├─ section: 학습 기술
│  ├─ h2
│  └─ ul
├─ section: 주간 일정
│  ├─ h2
│  └─ table
└─ section: 질문 폼
   ├─ h2
   └─ form
footer: 저작권 정보
```

정답 구조가 하나만 있는 것은 아닙니다. 중요한 것은 선택한 요소가 콘텐츠의 실제 역할과 관계를 설명하며, 그 이유를 자신의 말로 말할 수 있는지입니다.

## 개발 학습 프로필 완성하기

아래 코드에서 `TODO`를 먼저 말로 설명한 다음 직접 완성해 보세요.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BAM의 개발 학습 프로필</title>
  </head>
  <body>
    <header>
      <h1>BAM.dev</h1>
      <nav aria-label="주요 메뉴">
        <a href="#about">소개</a>
        <a href="#study">학습</a>
        <a href="#contact">질문</a>
      </nav>
    </header>

    <main>
      <article id="about">
        <h2>소개</h2>
        <figure>
          <img src="profile.jpg" alt="TODO: 이 문맥에서 이미지가 전달할 정보" />
          <figcaption>웹 개발을 공부하는 BAM</figcaption>
        </figure>
        <p>동작 원리를 이해하며 개발을 공부하고 있습니다.</p>
      </article>

      <section id="study">
        <h2>현재 학습 중인 기술</h2>
        <ul>
          <li>HTML</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>

        <h3>주간 학습 일정</h3>
        <table>
          <caption>요일별 핵심 학습 주제</caption>
          <thead>
            <tr>
              <th scope="col">요일</th>
              <th scope="col">주제</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">월요일</th>
              <td>HTML</td>
            </tr>
            <tr>
              <th scope="row">화요일</th>
              <td>CSS</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="contact">
        <h2>질문 보내기</h2>
        <form action="/questions" method="post">
          <p>
            <label for="email">답변받을 이메일</label>
            <input type="email" id="email" name="email" required />
          </p>
          <p>
            <label for="question">질문</label>
            <textarea
              id="question"
              name="question"
              minlength="10"
              required
            ></textarea>
          </p>
          <button type="submit">질문 보내기</button>
        </form>
      </section>
    </main>

    <footer>
      <p>© BAM.dev</p>
    </footer>
  </body>
</html>
```

이 문서를 열면 브라우저는 다음 흐름으로 처리합니다.

1. 문서 정보와 문자 인코딩을 읽습니다.
2. 요소 중첩을 바탕으로 DOM 트리를 만듭니다.
3. 링크의 fragment와 목적지 `id`를 연결합니다.
4. 이미지는 `src`의 별도 자원을 요청하고 사용할 수 없을 때 `alt`가 목적을 대신합니다.
5. 제출 버튼을 활성화하면 브라우저가 폼의 내장 제약 조건을 확인합니다.
6. 조건을 통과하면 `email`, `question` 이름과 현재 값으로 제출 데이터를 구성합니다.
7. `/questions`를 처리할 서버가 없다면 실제 질문 저장은 이루어지지 않습니다.

HTML은 요청 방법을 표현할 수 있지만 데이터베이스나 서버 처리 기능을 자동으로 만들지는 않습니다.

## 다섯 관점으로 검증하기

### 1. 요구사항과 구조

- 모든 요구사항이 문서 안에 있나요?
- 각 구역과 요소의 선택 이유를 설명할 수 있나요?
- 제목 계층이 콘텐츠의 상위·하위 관계와 맞나요?

### 2. 브라우저 기본 동작

- 브라우저 탭 제목이 알맞나요?
- 문서 내부 링크가 실제 `id` 위치로 이동하나요?
- 이미지 경로가 맞고, 이미지가 없을 때도 의미를 이해할 수 있나요?
- 필수 폼을 비운 채 제출하면 브라우저 안내가 나타나나요?

### 3. 개발자 도구의 DOM

Elements 패널에서 보는 것은 원본 파일 문자열이 아니라 브라우저가 파싱해 만든 DOM입니다. 부모·자식 관계가 예상과 같은지, 브라우저가 잘못된 중첩을 의도와 다르게 복구하지 않았는지 확인합니다.

### 4. Nu HTML Checker

[Nu HTML Checker](https://validator.w3.org/nu/)에 소스나 URL을 입력하여 의도하지 않은 문법·콘텐츠 모델 문제를 찾습니다. 오류를 먼저 고치고 경고는 코드의 문맥과 의도를 확인합니다.

검사 결과가 없다는 사실만으로 정보 구조, 링크 문구, 대체 텍스트, 실제 키보드 흐름이 모두 좋다고 인증되는 것은 아닙니다. 검사기는 실수를 찾는 한 가지 도구입니다.

### 5. 키보드와 대체 상황

- 마우스를 치우고 Tab과 Shift+Tab으로 모든 링크·입력·버튼에 이동합니다.
- 포커스 순서가 읽는 순서와 자연스럽게 이어지는지 확인합니다.
- 라디오·체크박스·`select`를 실제 키보드로 조작합니다.
- 이미지 주소를 잠시 잘못된 값으로 바꾸어 `alt`만으로 목적이 전달되는지 확인합니다.
- 링크 문구만 모아 읽어도 목적지를 예상할 수 있는지 확인합니다.
- 표 데이터가 어느 행·열 머리글에 속하는지 설명할 수 있는지 확인합니다.

## 추가 실습

### 실습 A: 의미 없는 구조 개선

```html
<div class="top">BAM.dev</div>
<div class="menu">
  <span onclick="location.href='index.html'">홈</span>
</div>
<div class="content">오늘의 학습 내용</div>
```

사이트 소개, 이동, 중심 내용의 역할에 맞는 요소로 바꾸고 왜 그 요소를 골랐는지 설명하세요.

### 실습 B: 폼 개선

```html
<form>
  <input id="user-email" placeholder="이메일" />
  <div onclick="submitForm()">가입</div>
</form>
```

보이는 레이블, 입력 유형, 제출 데이터 이름, 버튼 역할, 제출 목적지를 확인해 고쳐 보세요.

### 실습 C: 데이터 표 만들기

좋아하는 기술과 주간 학습 시간을 3행짜리 표로 만드세요. `caption`, 열 머리글과 행 머리글을 사용한 뒤 각 데이터 셀의 두 머리글을 말해 보세요.

## 흔한 혼동

- 완성 화면만 보고 소스와 DOM 구조를 확인하지 않습니다.
- 검사기 통과를 접근성 전체 검증으로 표현합니다.
- 반대로 검사기 경고를 이유 없이 모두 무시합니다.
- 자동 검사만 수행하고 키보드와 대체 상황을 직접 확인하지 않습니다.
- `action`을 작성하면 데이터를 저장할 서버도 자동으로 생긴다고 생각합니다.
- 요소를 의미가 아닌 현재 브라우저의 기본 모양으로 선택합니다.

## 최종 확인 문제

1. 코드를 쓰기 전에 콘텐츠 구조를 말로 나누면 어떤 실수를 줄일 수 있나요?
2. 원본 HTML 소스와 개발자 도구의 Elements에서 보는 DOM은 왜 다를 수 있나요?
3. Nu HTML Checker 통과만으로 링크 문구와 대체 텍스트 품질까지 보장할 수 없는 이유는 무엇인가요?
4. `name="question"`을 삭제하면 일반 폼 제출 데이터에 어떤 영향이 있나요?
5. `action="/questions"`를 작성하면 질문을 저장하는 서버 기능까지 만들어지나요?
6. 자동 검사와 키보드 직접 점검을 함께 수행해야 하는 이유를 설명해 보세요.

## 공식 자료

- [WHATWG HTML Standard: HTML 파싱](https://html.spec.whatwg.org/multipage/parsing.html)
- [WHATWG HTML Standard: 요소 사용 색인](https://html.spec.whatwg.org/multipage/indices.html#elements-3)
- [Nu HTML Checker: 검사기의 목적과 한계](https://html5.validator.nu/about.html)
- [W3C WAI: 기초 접근성 점검](https://www.w3.org/WAI/test-evaluate/preliminary/)
- [W3C WAI: 접근성 평가 도구만으로 접근성을 결정할 수 없는 이유](https://www.w3.org/WAI/test-evaluate/tools/selecting/)

공식 자료 확인일: 2026-08-18
