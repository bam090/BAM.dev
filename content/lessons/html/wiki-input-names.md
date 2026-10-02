# 폼 입력: 레이블·제출 이름·선택 컨트롤

## 학습 목표

- label·for/id·name·value의 역할을 구분해 입력 목적과 제출 데이터를 연결할 수 있습니다.
- 받을 값의 목적에 맞는 입력 타입·textarea·select를 선택할 수 있습니다.
- 하나 또는 여러 개를 고르는 조건에 맞게 radio·checkbox를 구성하고 그룹의 질문을 제공할 수 있습니다.

## 선수 개념

[HTML 시작하기: 요소와 문서의 기본 골격](#/learn/html/wiki-markup)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 폼이란

폼(form)은 입력 요소와 버튼을 묶어 입력값을 처리하거나 지정한 주소로 보내는 구조입니다.
앞 문서에서는 책모임의 준비물과 일정을 정보 관계에 맞게 정리했습니다.
이제 같은 모임에 참가할 사람의 이름·이메일·연락 방법을 받습니다.

```html
<form action="/club-applications" method="post">
  <!-- 입력 요소가 들어갈 자리 -->
</form>
```

- `action`은 데이터를 받을 주소입니다.
- `method`는 데이터를 보내는 방식을 정합니다.
- 이 문서의 `/club-applications`는 구조를 설명하기 위한 가상 주소입니다.
실제 서버와 연결되어 있지 않습니다.

## 레이블과 제출 이름의 역할

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
| `label` | 사람이 입력칸의 질문을 읽게 합니다. |
| `id` | 문서 안에서 요소를 고유하게 식별하고 `label`의 `for`와 연결합니다. |
| `name` | 제출할 데이터의 이름이 됩니다. |
| `value` | 글 입력에서는 처음 보여 줄 기본값을 정하고 checkbox·radio에서는 선택되었을 때 제출할 값을 정합니다. |

`for="applicant-email"`과 `id="applicant-email"`이 같아서 레이블과 입력칸이 연결됩니다.
연결된 레이블은 입력 목적을 보조 기술에 전달하고 레이블 글자도 입력 요소를 선택하거나 활성화할 수 있는 조작 영역으로 사용할 수 있게 합니다.

제출할 입력 요소에 `name`이 없으면 그 입력값은 일반적인 폼 제출 데이터에 포함되지 않습니다.
`name`이 있어도 레이블이 자동 연결되지는 않습니다.
`name`은 제출 이름이지 접근 가능한 이름이 아닙니다.

입력 요소를 `label` 안에 넣는 방법도 올바른 연결 방식입니다.
이 교안에서는 연결을 눈으로 확인하기 쉬운 `for`와 `id` 방식을 먼저 사용합니다.

`placeholder`는 입력을 시작하면 사라질 수 있으므로 입력 목적을 계속 알려 주는 `label`을 대신하지 않습니다.

입력의 목적과 제출 이름을 연결했습니다.
이제 받을 값이 글인지 날짜인지 선택지인지에 따라 입력 방법을 고릅니다.

---

## 입력 타입과 컨트롤의 선택

| 받을 값 | 먼저 검토할 요소·타입 | 이유 |
| --- | --- | --- |
| 짧은 일반 글 | `input type="text"` | 한 줄 글을 받습니다. |
| 이메일 주소 | `input type="email"` | 목적을 알리고 이메일 형식 내장 검증을 사용할 수 있습니다. |
| 전화번호 | `input type="tel"` | 전화번호 입력 목적을 알립니다. |
| 실제 계산할 수량 | `input type="number"` | 숫자 범위와 증감 조작을 사용할 수 있습니다. |
| 날짜 | `input type="date"` | 날짜 입력 목적을 알립니다. |
| 여러 줄 글 | `textarea` | 긴 의견이나 설명을 받습니다. |
| 고정된 목록 중 하나 | 단일 선택 `select` 또는 같은 `name`의 radio | 하나의 선택지만 고릅니다. |
| 각각 독립적인 선택 | checkbox | 여러 항목을 함께 고를 수 있습니다. |
| 파일 | `input type="file"` | 사용자가 파일을 선택합니다. |

전화번호·우편번호·회원 번호는 숫자처럼 보여도 계산할 수량이 아닙니다.
이런 식별자에 `number`를 무조건 사용하지 않습니다.

모든 검증 속성이 모든 입력 타입에 적용되는 것도 아닙니다.
예를 들어 문자열 길이를 정하는 `minlength`와 숫자·날짜 범위를 정하는 `min`은 역할이 다릅니다.

## 선택지의 그룹과 질문

```html
<fieldset>
  <legend>연락받을 방법</legend>

  <label>
    <input type="radio" name="contactMethod" value="email" required>
    이메일
  </label>

  <label>
    <input type="radio" name="contactMethod" value="phone">
    전화
  </label>
</fieldset>
```

- `fieldset`은 관련된 입력을 한 묶음으로 만듭니다.
- `legend`는 묶음 전체의 질문이며 `fieldset`의 첫 번째 자식으로 둡니다.
- radio가 같은 `name`을 가지면 한 그룹에서 하나만 고를 수 있습니다.
- 같은 `name`의 radio 중 하나에 `required`가 있으면 그 그룹에서 하나를 선택해야 합니다.
- 각 radio의 `value`는 화면에 보이는 글이 아니라 선택했을 때 보낼 값입니다.

checkbox는 항목마다 독립적으로 켜고 끕니다.
radio와 checkbox의 둥근 모양·네모 모양보다 `하나만 선택하는가`, `여러 개를 독립적으로 선택하는가`를 먼저 봅니다.

## 정리

- label과 for/id는 입력 목적을 연결하고 name은 제출할 데이터의 이름을 정합니다.
- 입력 타입은 겉모양보다 받을 값의 목적에 맞게 선택합니다.
- 같은 name의 radio는 하나를 선택하며 checkbox는 독립 선택을 나타냅니다.

## 이어서 연습하기

[접근 가능한 이메일 신청 폼](#/quest/html/accessible-form)에서 레이블·제출 이름·이메일 타입·필수 조건을 함께 작성합니다.
다음 [폼 검증과 제출](#/learn/html/wiki-form-submission)까지 읽고 시작하며 이 실습이 모든 입력 타입을 평가하는 것은 아닙니다.

## 공식 자료

기존 HTML 파생 교안을 바탕으로 설명과 예제를 재구성했습니다.

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

label은 사람에게 질문을 알려 주고 for와 입력의 id가 같으면 명시적으로 연결됩니다.
name은 제출 데이터의 이름이므로 일반 제출에 필요하지만 접근 가능한 이름이나 레이블 연결을 만들지는 않습니다.
글 입력의 value는 처음 값, checkbox/radio의 value는 선택했을 때 보낼 값입니다.
placeholder는 지속적인 레이블을 대신하지 않으며 입력을 label 안에 넣는 연결 방식도 가능합니다.
계산할 수량은 number를 검토하지만 전화번호·우편번호 같은 식별자는 모양만 보고 number를 쓰지 않습니다.
한 줄/여러 줄/고정 선택지/파일 등 받을 값의 목적에 맞는 컨트롤을 고릅니다.
하나만 고르는 radio는 같은 name으로 묶고 여러 독립 선택은 checkbox를 쓰며 fieldset과 첫 자식 legend로 그룹의 질문을 전합니다.
