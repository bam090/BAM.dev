# 링크와 버튼, 이동할 주소

## 학습 목표

이동과 동작을 구분해 링크 또는 버튼을 고르고 주소와 문구로 결과를 설명할 수 있습니다.

## 한줄 요약

다른 곳으로 이동하면 a와 href, 현재 화면에서 행동하면 button을 고르며 링크 문구는 목적지를 설명합니다.

## 먼저 확인할 개념

[HTML의 역할과 요소 읽기](#/learn/html/wiki-markup), [시맨틱 HTML: 내용의 역할과 제목 계층](#/learn/html/wiki-semantic-structure)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 목적부터 묻는 선택 순서

| 먼저 물을 질문 | 알맞은 관계 | 먼저 검토할 요소 |
| --- | --- | --- |
| 누르면 다른 곳으로 이동하는가? | 목적지로 이동 | `a href="…"` |
| 누르면 현재 화면에서 행동하는가? | 제출·열기·삭제 같은 동작 | `button` |

## 링크와 버튼은 결과로 구분한다

`href`가 있는 `a`는 목적지로 이동하는 링크다.
`button`은 행동을 실행하는 버튼이다.
CSS로 둘의 겉모양을 바꿔도 역할은 바뀌지 않는다.

```html
<a href="#schedule">9월 일정으로 이동</a>
<button type="button">신청 안내 열기</button>
<section id="schedule">
  <h2>9월 일정</h2>
</section>
```

- 첫 줄은 현재 문서의 `id="schedule"` 위치로 이동한다.
- 둘째 줄은 현재 화면에서 안내를 여는 동작을 맡을 자리다. 실제 동작은 JavaScript에서 연결한다.

링크 문구는 목적지를 알려 줘야 한다.
`여기`, `더 보기`만 반복하면 링크만 따로 읽었을 때 어디로 가는지 알기 어렵다.

```html
<a href="/clubs/night-reading">밤마을 책모임 소개 보기</a>
```

URL은 다음처럼 구분한다.

| 예 | 뜻 |
| --- | --- |
| `https://example.com/help` | 주소를 그 자체로 해석할 수 있는 절대 URL |
| `/help` | 현재 사이트의 맨 앞에서 찾는 상대 URL |
| `images/poster.jpg` | 현재 경로를 기준으로 찾는 상대 URL |
| `#schedule` | 현재 문서 안의 `id="schedule"` 위치 |

`/help`는 `/`로 시작하지만 그 자체만으로 어느 사이트인지 알 수 없으므로 절대 URL이 아니다.

별도의 기준 주소(base)를 설정하지 않았다면 `../`는 현재 문서가 있는 디렉터리에서 한 단계 위를 기준으로 목적지를 찾는다.
현재 주소가 `https://example.com/guides/start.html`이라면 다음 링크는 `https://example.com/help.html`을 가리킨다.

```html
<a href="../help.html">도움말 보기</a>
```

## 이어서 연습하기

[목적이 분명한 문서 내비게이션](#/quest/html/descriptive-navigation) — 문서 안의 목적지와 링크 문구를 연결합니다.

## 공식 자료

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [WAI Audio and Video Media](https://www.w3.org/WAI/media/av/)
- [MDN: 부모 디렉터리를 기준으로 상대 URL 해석하기](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#parent-directory_relative)

## 핵심 질문 답

사용 결과가 목적지로 이동하는 것이면 href가 있는 a, 현재 화면의 동작이면 button을 고릅니다.
절대 URL은 그 자체로 주소를 해석할 수 있고 상대 URL은 현재 사이트나 경로를 기준으로 계산합니다.
#fragment는 문서 안의 같은 id를 가리키므로 대상이 있어야 하며, /help도 사이트가 생략된 상대 URL입니다.
문구만 읽어도 이동 목적을 알 수 있게 씁니다.
