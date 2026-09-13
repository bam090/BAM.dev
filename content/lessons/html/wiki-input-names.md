# 입력의 레이블과 제출 이름

## 학습 목표

label·for/id·name·value의 역할을 구분해 입력 목적과 제출 데이터를 연결할 수 있습니다.

## 한줄 요약

label과 for/id는 입력 목적과 요소를 연결하고 name은 제출 이름, value는 입력 종류에 따른 기본값이나 제출값을 정합니다.

## 먼저 확인할 개념

[HTML의 역할과 요소 읽기](#/learn/html/wiki-markup)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 폼이 하는 일

폼(form)은 입력 요소와 버튼을 한 묶음으로 구성하고, 제출할 때 입력값을 정해진 방식으로 처리하거나 지정한 주소로 보낼 수 있는 구조다.

```html
<form action="/club-applications" method="post">
  <!-- 입력 요소가 들어갈 자리 -->
</form>
```

- `action`은 데이터를 받을 주소다.
- `method`는 데이터를 보내는 방식을 정한다.
- 이 문서의 `/club-applications`는 구조를 설명하기 위한 가상 주소다. 실제 서버와 연결되어 있지 않다.

## 입력 하나에는 서로 다른 네 역할이 있다

```html
<label for="applicant-email">이메일</label>
<input
  id="applicant-email"
  name="email"
  type="email"
>
```

| 부분 | 하는 일 |
| --- | --- |
| `label` | 사람이 입력칸의 질문을 읽게 한다. |
| `id` | 문서 안에서 요소를 고유하게 식별하고 `label`의 `for`와 연결한다. |
| `name` | 제출할 데이터의 이름이 된다. |
| `value` | 글 입력에서는 처음 보여 줄 기본값을 정하고, checkbox·radio에서는 선택되었을 때 제출할 값을 정한다. |

`for="applicant-email"`과 `id="applicant-email"`이 같아서 레이블과 입력칸이 연결된다.
연결된 레이블은 입력 목적을 보조 기술에 전달하고, 레이블 글자도 입력 요소를 선택하거나 활성화할 수 있는 조작 영역으로 사용할 수 있게 한다.

제출할 입력 요소에 `name`이 없으면 그 입력값은 일반적인 폼 제출 데이터에 포함되지 않는다.
`name`이 있어도 레이블이 자동 연결되지는 않는다.
`name`은 제출 이름이지 접근 가능한 이름이 아니다.

입력 요소를 `label` 안에 넣는 방법도 올바른 연결 방식이다.
이 교안에서는 연결을 눈으로 확인하기 쉬운 `for`와 `id` 방식을 먼저 사용한다.

`placeholder`는 입력을 시작하면 사라질 수 있으므로 입력 목적을 계속 알려 주는 `label`을 대신하지 않는다.

## 이어서 연습하기

[접근 가능한 이메일 신청 폼](#/quest/html/accessible-form) — 입력 타입과 내장 검증까지 읽은 뒤 레이블·제출 이름을 함께 작성합니다.

## 공식 자료

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

label은 사람에게 질문을 알려 주고 for와 입력의 id가 같으면 명시적으로 연결됩니다.
name은 제출 데이터의 이름이므로 일반 제출에 필요하지만 접근 가능한 이름이나 레이블 연결을 만들지는 않습니다.
글 입력의 value는 처음 값, checkbox/radio의 value는 선택했을 때 보낼 값입니다.
placeholder는 지속적인 레이블을 대신하지 않으며 입력을 label 안에 넣는 연결 방식도 가능합니다.
