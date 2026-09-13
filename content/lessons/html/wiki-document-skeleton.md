# HTML 문서의 기본 골격

## 학습 목표

본문과 문서 정보를 구분하고 doctype·lang·title·charset·viewport의 역할을 설명할 수 있습니다.

## 한줄 요약

head는 문서 정보를, body는 페이지 내용을 담으며 doctype·언어·제목·인코딩·viewport는 서로 다른 역할을 합니다.

## 먼저 확인할 개념

[HTML의 역할과 요소 읽기](#/learn/html/wiki-markup)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 문서의 기본 골격

초보자 예제에서는 다음 골격을 빠뜨리지 않고 적는다.
눈에 보이는 본문과 문서를 설명하는 정보를 구분하기 쉬워지기 때문이다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>밤마을 책모임</title>
  </head>
  <body>
    <h1>밤마을 책모임</h1>
  </body>
</html>
```

각 줄은 같은 종류의 설정이 아니다.

| 코드 | 하는 일 | 구분 |
| --- | --- | --- |
| `<!doctype html>` | 브라우저가 과거 문서용 호환 모드가 아니라 표준 모드로 처리하도록 한다. | 문서 앞에 두는 필수 문구이며 HTML 요소나 버전 번호가 아니다. |
| `<html lang="ko">` | 문서 내용의 기본 언어가 한국어임을 알린다. | 발음·번역 등 문서 이해와 접근성을 돕는다. |
| `<title>` | 탭, 방문 기록, 북마크 등에서 문서를 구분할 이름을 정한다. | 보통의 HTML 문서에 필요한 문서 제목이며 본문의 `h1`과 역할이 다르다. |
| `<meta charset="utf-8">` | 파일의 바이트를 어떤 문자로 읽을지 선언한다. | 문자 해석 정보다. 실제 파일도 UTF-8로 저장해야 한다. |
| viewport 문서 정보(metadata) | 작은 화면에서 초기 표시 영역을 기기 너비에 맞추도록 돕는다. | HTML 문법 성립에 필요한 항목은 아니지만 화면 폭에 맞춰 배치가 달라지는 페이지의 일반적인 권장 설정이다. |

viewport 설정 하나만 넣는다고 작은 화면용 배치가 완성되지는 않는다.
CSS와 실제 좁은 화면 검사가 따로 필요하다.
확대를 막는 `user-scalable=no` 같은 설정은 사용하지 않는다.

`head`에는 문서 자체를 설명하거나 연결하는 정보가 들어간다.
`body`에는 사용자가 읽고 조작할 페이지 내용이 들어간다.
`head`와 화면 머리말을 뜻하는 `header`는 다른 요소다.

## 이어서 연습하기

[의미 있는 학습 기록 구조](#/quest/html/document-structure) — 내용의 역할과 제목을 배운 뒤 문서 구조를 함께 작성하는 실습입니다.

## 공식 자료

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [CSS Viewport Module Level 1 — Viewport meta](https://drafts.csswg.org/css-viewport/#viewport-meta)
- [WAI Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/)

## 핵심 질문 답

head에는 문서를 설명하거나 연결하는 정보를 두고 body에는 읽고 조작할 내용을 둡니다.
doctype은 표준 모드로 처리하도록 하는 문서 앞 문구이고, lang은 기본 언어, title은 탭 등에 쓰는 문서 이름, charset은 문자 해석, viewport는 초기 표시 영역을 알립니다.
이들은 모두 같은 종류의 필수 문법은 아니며 viewport만으로 반응형 배치가 완성되지는 않습니다.
