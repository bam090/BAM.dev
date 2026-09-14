# 비동기 화면의 진행 상태

## 학습 목표

요청 전·대기·성공·실패를 상태로 나누어 데이터와 사용자 안내를 함께 갱신할 수 있습니다.

## 한줄 요약

loading을 먼저 보여 주고 결과에 따라 success나 error로 바꾼 뒤 현재 상태를 다시 그립니다.

## 먼저 확인할 개념

[async·await와 실패 처리](#/learn/javascript/wiki-async-await) · [폼 입력에서 상태와 화면으로](#/learn/javascript/wiki-forms-state)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

HTML이 먼저 준비된 브라우저에서 해당 JavaScript를 실행합니다. 이 문서의 같은 예제는 제시한 순서로 연결하고, 독립 예제의 같은 변수 이름을 한 스크립트로 겹쳐 붙이지 않습니다.

## 늦게 도착하는 결과를 화면 상태로 나눈다

아래 데이터는 실제 BAM 파일이 아니다.
`교안 예제 안에서 프로젝트에 함께 넣어 둔 연습용 응답 데이터라고 가정한 값`이다.
실제 프로젝트에 해당 파일이나 값이 있다고 주장하지 않는다.

먼저 결과를 보여 줄 자리를 준비한다.

```html
<p id="lesson-status" role="status"></p>
<ul id="lesson-list"></ul>
```

```js
const lessonResponseData = [
  { id: 1, title: "변수" },
  { id: 2, title: "함수" },
];

function readLessonResponse(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("연습용 응답을 읽지 못했습니다."));
        return;
      }

      resolve(lessonResponseData);
    }, 300);
  });
}

const lessonStatus = document.querySelector("#lesson-status");
const lessonList = document.querySelector("#lesson-list");

const lessonState = {
  phase: "idle",
  lessons: [],
};

function renderLessons() {
  lessonStatus.textContent = {
    idle: "아직 불러오지 않았습니다.",
    loading: "학습 목록을 불러오는 중입니다.",
    success: `${lessonState.lessons.length}개를 불러왔습니다.`,
    error: "학습 목록을 불러오지 못했습니다.",
  }[lessonState.phase];

  lessonList.replaceChildren();

  for (const lesson of lessonState.lessons) {
    const item = document.createElement("li");
    item.textContent = lesson.title;
    lessonList.append(item);
  }
}

async function showLessons(shouldFail = false) {
  lessonState.phase = "loading";
  lessonState.lessons = [];
  renderLessons();

  try {
    lessonState.lessons = await readLessonResponse(shouldFail);
    lessonState.phase = "success";
  } catch (error) {
    console.error(error);
    lessonState.phase = "error";
  }

  renderLessons();
}

showLessons();
```

이 예의 흐름은 다음과 같다.

```text
loading을 먼저 표시
→ Promise 반환
→ 현재 async 함수만 대기
→ 성공이면 목록을 넣고 success
→ 실패면 목록을 비우고 error
→ 현재 상태로 다시 render
```

`showLessons(true)`로 바꾸면 같은 흐름에서 실패 상태도 확인할 수 있다.
성공과 오류를 서로 다른 함수로 떼어 놓지 않고
`loading → success 또는 error`로 이어지는 한 흐름에서 보는 것이 중요하다.
HTTP 요청을 다루는 방법은 [fetch 응답의 실패 경계](#/learn/javascript/wiki-fetch)에서 이어서 확인한다.

## 이어서 연습하기

[비동기 작업 조합: 순차 실행과 동시 시작](#/learn/javascript/wiki-async-composition)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — Promise Objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html#sec-promise-objects)
- [ECMAScript 2026 — Async Function Definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-async-function-definitions)
- [WHATWG HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

## 핵심 질문 답

작업을 기다리기 전에 loading으로 바꾸고 render해 진행 상태를 알립니다. 성공하면 받은 자료와 success를, 실패하면 요구에 맞는 빈 목록과 error를 상태에 넣고 다시 render합니다. 이전 자료를 지울지 유지할지는 기능의 약속이며 이 예는 loading과 실패에서 목록을 비웁니다. 단계 변경만 하고 render를 빠뜨리면 상태와 화면이 어긋납니다.
