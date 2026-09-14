# 신청 폼을 끝까지 읽고 조작하기

## 학습 목표

작은 폼에서 입력 목적부터 검증·제출까지의 관계를 따라가고 키보드로 실제 흐름을 확인할 수 있습니다.

## 한줄 요약

폼은 label → 입력 → name → 내장 검증 → submit 순서로 읽고, 키보드와 오류 안내까지 직접 확인합니다.

## 먼저 확인할 개념

[입력의 레이블과 제출 이름](#/learn/html/wiki-input-names), [폼 컨트롤: 값과 선택에 맞는 입력 고르기](#/learn/html/wiki-form-controls), [HTML 폼 내장 검증의 역할과 한계](#/learn/html/wiki-constraint-validation), [폼 제출: 보내는 값과 GET·POST 방식](#/learn/html/wiki-form-submission)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 작은 신청 폼을 흐름으로 읽기

```html
<form action="/club-applications" method="post">
  <p>
    <label for="applicant-name">이름 (필수)</label>
    <input
      id="applicant-name"
      name="applicantName"
      autocomplete="name"
      required
      minlength="2"
    >
  </p>

  <p>
    <label for="applicant-email">이메일 (필수)</label>
    <input
      id="applicant-email"
      name="email"
      type="email"
      autocomplete="email"
      required
    >
  </p>

  <p>
    <label for="meeting-date">희망 날짜 (필수)</label>
    <input
      id="meeting-date"
      name="meetingDate"
      type="date"
      required
    >
  </p>

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

  <p>
    <label for="note">미리 알려 둘 내용</label>
    <textarea id="note" name="note" maxlength="200"></textarea>
  </p>

  <button type="submit">신청 보내기</button>
</form>
```

이 폼을 다음 순서로 읽는다.

1. `label`이 각 입력의 뜻을 알려 준다.
2. `input`, `textarea`, radio가 값을 받는다.
3. `name`이 제출 데이터의 이름을 정한다.
4. `type`, `required`, `minlength`, `maxlength`가 흔한 입력 실수를 검사한다.
5. `button type="submit"`이 폼 제출을 실행한다.

`autocomplete="name"`과 `autocomplete="email"`은 값의 목적을 브라우저에 알려, 사용자가 저장해 둔 정보를 자동으로 채우는 일을 도울 수 있다.
이는 `label`이나 `name`을 대신하지 않는다.

폼 안에서 `button`의 `type`을 생략하면 제출 버튼으로 작동할 수 있다.
의도를 분명히 하고 예상하지 않은 제출을 막기 위해 `submit` 또는 `button`을 명시한다.
`type="reset"`은 입력을 처음 값으로 되돌려 사용자의 작성 내용을 잃게 할 수 있으므로 꼭 필요한지 먼저 판단한다.

## 키보드로 확인하는 순서

마우스를 잠시 내려놓고 다음을 직접 확인한다.

키보드 초점은 다음 키 입력을 받을 현재 요소를 뜻한다.

1. `Tab`과 `Shift+Tab`으로 입력 요소와 제출 버튼을 논리적인 순서로 이동할 수 있는가?
2. 현재 초점이 어디인지 화면에서 알아볼 수 있는가?
3. 레이블을 읽었을 때 입력 목적을 알 수 있는가?
4. checkbox는 `Space`, radio 그룹은 화살표 키 같은 기본 키보드 동작으로 조작되는가?
5. 제출 버튼을 `Enter`나 `Space`로 실행할 수 있는가?
6. 잘못 입력했을 때 어떤 값이 왜 잘못됐는지 글로 알 수 있는가?

기본 HTML 요소는 브라우저의 기본 키보드 동작을 제공한다.
그러나 CSS로 초점 표시를 없애거나 JavaScript로 동작을 잘못 바꾸면 문제가 생길 수 있으므로 완성 화면에서도 다시 확인한다.

## 이어서 연습하기

[접근 가능한 이메일 신청 폼](#/quest/html/accessible-form) — 레이블·제출 이름·이메일 타입·필수 조건을 직접 작성합니다. 키보드 흐름은 완성 화면에서 따로 확인합니다.

## 공식 자료

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

label로 질문을 읽고 입력 요소가 받을 값과 name으로 보낼 이름을 확인한 뒤 type·required·길이 조건과 submit 버튼을 차례로 봅니다.
autocomplete은 입력 목적의 힌트이고 label/name을 대신하지 않습니다.
제출하지 않는 버튼에는 button을 명시하고 reset은 처음 값으로 돌아가 현재 작성을 잃을 수 있음을 구분합니다.
Tab·Shift+Tab, Space·화살표·Enter로 입력·선택·오류 확인·제출까지 사용하며 초점 표시와 순서도 확인합니다.
