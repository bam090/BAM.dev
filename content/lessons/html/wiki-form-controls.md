# 받을 값과 선택 관계에 맞는 입력

## 학습 목표

받을 값의 목적과 하나/여러 개 선택 조건에 따라 입력 타입·컨트롤·그룹을 고를 수 있습니다.

## 한줄 요약

입력은 값의 목적에 맞게 고르고 하나의 선택은 같은 name의 radio, 독립된 여러 선택은 checkbox로 나타냅니다.

## 먼저 확인할 개념

[입력의 레이블과 제출 이름](#/learn/html/wiki-input-names)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 입력 목적에 맞는 요소와 타입을 고른다

| 받을 값 | 먼저 검토할 요소·타입 | 이유 |
| --- | --- | --- |
| 짧은 일반 글 | `input type="text"` | 한 줄 글을 받는다. |
| 이메일 주소 | `input type="email"` | 목적을 알리고 이메일 형식 내장 검증을 사용할 수 있다. |
| 전화번호 | `input type="tel"` | 전화번호 입력 목적을 알린다. |
| 실제 계산할 수량 | `input type="number"` | 숫자 범위와 증감 조작을 사용할 수 있다. |
| 날짜 | `input type="date"` | 날짜 입력 목적을 알린다. |
| 여러 줄 글 | `textarea` | 긴 의견이나 설명을 받는다. |
| 고정된 목록 중 하나 | 단일 선택 `select` 또는 같은 `name`의 radio | 하나의 선택지만 고른다. |
| 각각 독립적인 선택 | checkbox | 여러 항목을 함께 고를 수 있다. |
| 파일 | `input type="file"` | 사용자가 파일을 선택한다. |

전화번호·우편번호·회원 번호는 숫자처럼 보여도 계산할 수량이 아니다.
이런 식별자에 `number`를 무조건 사용하지 않는다.

모든 검증 속성이 모든 입력 타입에 적용되는 것도 아니다.
예를 들어 문자열 길이를 정하는 `minlength`와 숫자·날짜 범위를 정하는 `min`은 역할이 다르다.

## 관련된 선택지는 질문과 함께 묶는다

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

- `fieldset`은 관련된 입력을 한 묶음으로 만든다.
- `legend`는 묶음 전체의 질문이며 `fieldset`의 첫 번째 자식으로 둔다.
- radio가 같은 `name`을 가지면 한 그룹에서 하나만 고를 수 있다.
- 같은 `name`의 radio 중 하나에 `required`가 있으면 그 그룹에서 하나를 선택해야 한다.
- 각 radio의 `value`는 화면에 보이는 글이 아니라 선택했을 때 보낼 값이다.

checkbox는 항목마다 독립적으로 켜고 끈다.
radio와 checkbox의 둥근 모양·네모 모양보다 `하나만 선택하는가`, `여러 개를 독립적으로 선택하는가`를 먼저 본다.

## 이어서 연습하기

[접근 가능한 이메일 신청 폼](#/quest/html/accessible-form) — 레이블·제출 이름·이메일 타입·필수 조건을 함께 작성하는 실습입니다. 모든 입력 타입을 평가하는 실습은 아닙니다.

## 공식 자료

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

계산할 수량은 number를 검토하지만 전화번호·우편번호 같은 식별자는 모양만 보고 number를 쓰지 않습니다.
한 줄/여러 줄/고정 선택지/파일 등 받을 값의 목적에 맞는 컨트롤을 고릅니다.
하나만 고르는 radio는 같은 name으로 묶고 여러 독립 선택은 checkbox를 쓰며 fieldset과 첫 자식 legend로 그룹의 질문을 전합니다.
