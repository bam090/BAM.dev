# 링크와 버튼, 이동할 주소

## 학습 목표

- 이동과 동작을 구분해 링크와 버튼을 선택할 수 있습니다.
- 절대 URL·상대 URL·문서 내부 목적지의 차이를 설명할 수 있습니다.
- 목적지를 알 수 있는 링크 문구와 유효한 연결을 작성할 수 있습니다.

## 선수 개념

[HTML 시작하기: 요소와 문서의 기본 골격](#/learn/html/wiki-markup), [시맨틱 HTML: 내용의 역할과 제목 계층](#/learn/html/wiki-semantic-structure)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 링크와 버튼이란

링크는 다른 주소나 문서 안의 위치로 이동하는 요소이고 버튼은 사용자의 동작을 실행하는 요소입니다.
앞 문서에서는 책모임 소개와 일정을 의미 있는 영역으로 나눴습니다.
이제 일정으로 이동하는 링크와 신청 안내를 여는 버튼을 구분합니다.

## 목적에 따른 요소 선택

| 먼저 물을 질문 | 알맞은 관계 | 먼저 검토할 요소 |
| --- | --- | --- |
| 누르면 다른 곳으로 이동하는가? | 목적지로 이동 | `a href="…"` |
| 누르면 현재 화면에서 행동하는가? | 제출·열기·삭제 같은 동작 | `button` |

## 링크와 버튼의 역할

`href`가 있는 `a`는 목적지로 이동하는 링크입니다.
`button`은 행동을 실행하는 버튼입니다.
CSS로 둘의 겉모양을 바꿔도 역할은 바뀌지 않습니다.

```html
<a href="#schedule">9월 일정으로 이동</a>
<button type="button">신청 안내 열기</button>
<section id="schedule">
  <h2>9월 일정</h2>
</section>
```

- 첫 줄은 현재 문서의 `id="schedule"` 위치로 이동합니다.
- 둘째 줄은 현재 화면에서 안내를 여는 동작을 맡을 자리입니다.
실제 동작은 JavaScript에서 연결합니다.

링크 문구는 목적지를 알려 줘야 합니다.
`여기`, `더 보기`만 반복하면 링크만 따로 읽었을 때 어디로 가는지 알기 어렵습니다.

```html
<a href="/clubs/night-reading">밤마을 책모임 소개 보기</a>
```

URL은 다음처럼 구분합니다.

| 예 | 뜻 |
| --- | --- |
| `https://example.com/help` | 주소를 그 자체로 해석할 수 있는 절대 URL |
| `/help` | 현재 사이트의 맨 앞에서 찾는 상대 URL |
| `images/poster.jpg` | 현재 경로를 기준으로 찾는 상대 URL |
| `#schedule` | 현재 문서 안의 `id="schedule"` 위치 |

`/help`는 `/`로 시작하지만 그 자체만으로 어느 사이트인지 알 수 없으므로 절대 URL이 아닙니다.

별도의 기준 주소(base)를 설정하지 않았다면 `../`는 현재 문서가 있는 디렉터리에서 한 단계 위를 기준으로 목적지를 찾습니다.
현재 주소가 `https://example.com/guides/start.html`이라면 다음 링크는 `https://example.com/help.html`을 가리킵니다.

```html
<a href="../help.html">도움말 보기</a>
```

## 정리

- 목적지로 이동할 때는 a와 href를 사용하고 동작에는 button을 사용합니다.
- 상대 URL은 현재 사이트나 문서 경로를 기준으로 해석합니다.
- 문서 내부 링크는 실제 id와 연결하고 문구로 목적지를 알립니다.

## 이어서 연습하기

[목적이 분명한 문서 내비게이션](#/quest/html/descriptive-navigation)에서 문서 안의 목적지와 링크 문구를 연결합니다.

## 공식 자료

기존 HTML 파생 교안을 바탕으로 설명과 예제를 재구성했습니다.

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [MDN: 부모 디렉터리를 기준으로 상대 URL 해석하기](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#parent-directory_relative)

## 핵심 질문 답

사용 결과가 목적지로 이동하는 것이면 href가 있는 a, 현재 화면의 동작이면 button을 고릅니다.
절대 URL은 그 자체로 주소를 해석할 수 있고 상대 URL은 현재 사이트나 경로를 기준으로 계산합니다.
`#fragment`는 문서 안의 같은 id를 가리키므로 대상이 있어야 하며 /help도 사이트가 생략된 상대 URL입니다.
문구만 읽어도 이동 목적을 알 수 있게 씁니다.
