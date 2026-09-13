# HTML의 역할과 요소 읽기

## 학습 목표

HTML 한 줄에서 태그·요소·속성과 중첩을 구분하고 빈 요소를 올바르게 설명할 수 있습니다.

## 한줄 요약

HTML은 내용의 관계를 표현하며 태그는 요소의 경계, 속성은 추가 정보, 중첩은 요소 사이의 관계를 나타냅니다.

## 먼저 알아둘 세 가지

- 브라우저: Chrome이나 Safari처럼 웹페이지 파일을 읽어 화면에 보여 주는 프로그램
- 웹페이지: 브라우저에서 하나의 문서로 여는 내용
- 파일과 폴더: 파일은 내용을 저장한 한 묶음이고, 폴더는 여러 파일을 정리하는 상자다.

웹페이지를 집에 비유하면 HTML은 방의 용도를 정하는 설계도에 가깝다.
CSS는 색과 크기 같은 꾸밈을 맡고, JavaScript는 버튼을 눌렀을 때 내용이 바뀌는 동작을 맡는다.
실제 웹에서는 역할이 완전히 칼로 나뉘지는 않지만, 처음에는 다음처럼 구분하면 된다.

| 기술 | 먼저 맡는 일 |
| --- | --- |
| HTML | 내용의 종류와 관계를 표시한다. |
| CSS | 내용이 보이는 모양과 배치를 정한다. |
| JavaScript | 사용자 행동에 반응하고 상태를 바꾼다. |

## HTML 한 줄을 읽는 법

```html
<p class="notice">모임은 오후 7시에 시작합니다.</p>
```

- `<p>`와 `</p>`는 요소의 시작과 끝을 표시하는 태그다.
- `<p class="notice">...</p>` 전체가 `p` 요소다.
- `class="notice"`는 요소에 추가 정보를 주는 속성이다.
- 요소의 시작 태그와 종료 태그 사이에 다른 요소를 넣는 관계를 중첩이라고 한다.

대부분의 요소는 시작 태그와 종료 태그가 있다.
그러나 `img`, `input`, `meta`처럼 내용과 종료 태그가 없는 요소도 있다.
이를 빈 요소(void element)라고 한다.

```html
<img src="book.jpg" alt="책 표지">
```

HTML에서 `<img />` 끝의 `/`는 요소를 닫는 기능이 없다.
빈 요소에는 `</img>` 같은 종료 태그를 쓰지 않는다.

## 이어서 연습하기

[의미 있는 학습 기록 구조](#/quest/html/document-structure) — 문서의 기본 골격과 내용 구조를 읽은 뒤 함께 적용하는 실습입니다.

## 공식 자료

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [CSS Viewport Module Level 1 — Viewport meta](https://drafts.csswg.org/css-viewport/#viewport-meta)
- [WAI Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/)

## 핵심 질문 답

시작·종료를 표시하는 부분은 태그이고 내용까지 포함한 전체는 요소입니다.
시작 태그에 있는 class 같은 정보는 속성이며 요소 안에 요소를 넣는 관계는 중첩입니다.
img·input·meta 같은 빈 요소에는 내용과 종료 태그가 없고, HTML에서 끝의 /가 요소를 닫지는 않습니다.
