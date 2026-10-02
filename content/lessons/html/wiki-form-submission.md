# 폼 검증과 제출: 입력부터 전송까지

## 학습 목표

- 입력 조건에 맞는 검증 속성을 선택하고 서버 검증과의 경계를 설명할 수 있습니다.
- 입력 상태에 따라 제출되는 값을 구분하고 GET·POST·파일 전송 설정을 설명할 수 있습니다.
- 신청 폼에서 입력·검증·제출의 관계와 버튼의 기본 동작을 추적할 수 있습니다.
- 키보드 초점·조작 순서·오류 안내를 확인하는 절차를 설명할 수 있습니다.

## 선수 개념

[폼 입력: 레이블·제출 이름·선택 컨트롤](#/learn/html/wiki-input-names)에서 입력 목적과 제출할 값을 먼저 연결합니다.

## 폼 검증과 제출의 흐름

폼 검증은 입력값이 조건을 만족하는지 확인하는 과정이고 제출은 그 값을 정해진 방식으로 보내는 과정입니다.
앞 문서에서 책모임 신청에 필요한 레이블·제출 이름·컨트롤을 구성했습니다.
이번에는 입력 조건을 확인하고 어떤 값이 전송되는지 살펴봅니다.

## 내장 검증의 조건과 한계

HTML 검증 속성을 사용하면 브라우저가 제출 전에 일부 잘못된 입력을 확인할 수 있습니다.

| 속성 | 확인하는 것 | 주의할 점 |
| --- | --- | --- |
| `required` | 값을 비워 둘 수 없는가 | 빈 값을 막는 역할입니다. |
| `minlength`, `maxlength` | 문자열 길이가 범위 안인가 | `minlength`만으로 빈 값을 막지는 않습니다. |
| `min`, `max` | 숫자·날짜·시간 값이 범위 안인가 | 글자 수를 정하는 속성이 아닙니다. |
| `pattern` | 허용한 전체 형식과 맞는가 | 빈 값도 막으려면 `required`가 따로 필요합니다. |
| `type="email"` | 이메일 주소 형식에 맞는가 | 실제 주소가 존재하는지까지 확인하지는 않습니다. |

입력 형식은 사용자가 틀린 뒤에만 보여 주지 말고 입력하기 전에 보이는 글로 알려 줍니다.
지나치게 엄격한 `pattern`은 정상적인 전화번호나 이름까지 막을 수 있으므로 목적에 필요한 만큼만 사용합니다.

직접 오류 문구를 만들 때는 어떤 입력이 왜 잘못됐고 어떻게 고칠지를 글로 설명합니다.
색만으로 오류를 구분하지 않고 가능하면 오류 문구를 해당 입력과 연결합니다.

브라우저 내장 검증은 사용자에게 빠른 안내를 주지만 우회할 수 있습니다.
서버는 받은 값을 반드시 다시 검증해야 합니다.
내장 검증을 통과했다는 사실만으로 데이터가 안전하거나 폼이 접근 가능하다고 판정하지 않습니다.

입력 조건을 정했으면 제출 데이터에 포함될 값과 전송 방식을 확인합니다.

---

## 제출 주소와 방식

신청 폼은 입력값을 받을 주소와 전송 방식을 `form`의 속성으로 지정합니다.

```html
<form action="/club-applications" method="post">
  <!-- 입력 요소가 들어갈 자리 -->
</form>
```

- `action`은 데이터를 받을 주소입니다.
- `method`는 데이터를 보내는 방식을 정합니다.
- 이 문서의 `/club-applications`는 구조를 설명하기 위한 가상 주소입니다.
실제 서버와 연결되어 있지 않습니다.

전송할 주소를 정해도 모든 입력값이 제출되는 것은 아닙니다.
일반적인 이름·값 제출에서는 `name`이 없는 입력과 선택하지 않은 checkbox·radio의 값이 빠집니다.
이름이 있어도 비활성화된 입력은 제외되므로 상태를 함께 확인합니다.

## disabled와 readonly의 차이

| 상태 | 사용자가 바꿀 수 있는가 | 일반 제출에 포함되는가 | 내장 검증 대상인가 | 기본 키보드 초점을 받는가 |
| --- | --- | --- | --- | --- |
| `disabled` | 아니요 | 아니요 | 아니요 | 아니요 |
| `readonly` | 아니요 | 예 | 아니요 | 적용 가능한 입력에서는 예 |

수정을 막되 서버에는 값을 보내야 하는 입력에 `disabled`를 쓰면 값이 빠질 수 있습니다.
`readonly`는 모든 입력 타입에 적용되는 속성도 아니므로 해당 입력이 지원하는지 확인합니다.
CSS로 회색을 칠하는 것만으로 이 상태가 생기지는 않습니다.

## GET·POST와 파일 전송의 입문 구분

- GET 폼은 제출 값을 주소 끝의 `?name=value` 같은 질의 부분에 붙입니다.
검색처럼 결과 주소를 저장하거나 공유하기 좋은 조회에 자주 사용합니다.
비밀값을 보내는 방법으로 사용하지 않습니다.
- POST 폼은 제출 데이터를 요청 본문에 담아 보냅니다.
서버 상태를 바꾸거나 큰 데이터를 보낼 때 자주 사용하지만 POST 자체가 암호화 기능은 아닙니다.
- 전송 내용을 보호하려면 HTTPS 같은 별도 수단이 필요합니다.
- 파일을 보내는 폼은 일반적으로 `method="post"`와 `enctype="multipart/form-data"`를 사용합니다.
`enctype`은 제출 데이터를 어떤 형식으로 묶을지 정합니다.

```html
<form action="/club-files" method="post" enctype="multipart/form-data">
  <label for="reading-note">독서 메모 파일</label>
  <input id="reading-note" name="readingNote" type="file">
  <button type="submit">파일 보내기</button>
</form>
```

GET·POST는 전송 방식이며 조회·생성·수정·삭제 같은 서비스 동작과 정확히 일대일로 대응하는 이름은 아닙니다.

이제 같은 신청 폼에서 입력·검증·제출을 연결하고 키보드 흐름을 확인합니다.

---

## 신청 폼의 입력·검증·제출

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

이 폼을 다음 순서로 읽습니다.

1. `label`이 각 입력의 뜻을 알려 줍니다.
2. `input`, `textarea`, radio가 값을 받습니다.
3. `name`이 제출 데이터의 이름을 정합니다.
4. `type`, `required`, `minlength`, `maxlength`가 흔한 입력 실수를 검사합니다.
5. `button type="submit"`이 폼 제출을 실행합니다.

`autocomplete="name"`과 `autocomplete="email"`은 값의 목적을 브라우저에 알려, 사용자가 저장해 둔 정보를 자동으로 채우는 일을 도울 수 있습니다.
이는 `label`이나 `name`을 대신하지 않습니다.

폼 안에서 `button`의 `type`을 생략하면 제출 버튼으로 작동할 수 있습니다.
의도를 분명히 하고 예상하지 않은 제출을 막기 위해 `submit` 또는 `button`을 명시합니다.
`type="reset"`은 입력을 처음 값으로 되돌려 사용자의 작성 내용을 잃게 할 수 있으므로 꼭 필요한지 먼저 판단합니다.

입력과 제출의 관계를 읽었으면 마우스 없이 같은 순서로 사용할 수 있는지 확인합니다.

## 키보드 조작의 확인 순서

마우스를 잠시 내려놓고 다음을 직접 확인합니다.

키보드 초점은 다음 키 입력을 받을 현재 요소를 뜻합니다.

1. `Tab`과 `Shift+Tab`으로 입력 요소와 제출 버튼을 논리적인 순서로 이동할 수 있는가?
2. 현재 초점이 어디인지 화면에서 알아볼 수 있는가?
3. 레이블을 읽었을 때 입력 목적을 알 수 있는가?
4. checkbox는 `Space`, radio 그룹은 화살표 키 같은 기본 키보드 동작으로 조작되는가?
5. 제출 버튼을 `Enter`나 `Space`로 실행할 수 있는가?
6. 잘못 입력했을 때 어떤 값이 왜 잘못됐는지 글로 알 수 있는가?

기본 HTML 요소는 브라우저의 기본 키보드 동작을 제공합니다.
그러나 CSS로 초점 표시를 없애거나 JavaScript로 동작을 잘못 바꾸면 문제가 생길 수 있으므로 완성 화면에서도 다시 확인합니다.

## 정리

- 내장 검증은 빠른 안내이며 서버의 값 검증을 대신하지 않습니다.
- 입력 상태가 제출값을 결정하고 method·enctype이 전송 방식을 정합니다.
- 레이블부터 제출 버튼까지 키보드 흐름과 오류 안내를 함께 확인합니다.

## 이어서 연습하기

[접근 가능한 이메일 신청 폼](#/quest/html/accessible-form)에서 레이블·제출 이름·이메일 타입·필수 조건을 직접 작성합니다.
키보드 흐름은 완성 화면에서 별도로 확인합니다.
GET·POST·파일 전송을 실제 서버에 연결해 검증하는 실습은 아직 제공하지 않습니다.
예시 action은 가상 주소이며 서버 저장이 실행된 결과가 아닙니다.

## 공식 자료

기존 HTML 파생 교안을 바탕으로 설명과 예제를 재구성했습니다.

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

required는 빈 값을 막고 minlength는 글자 수, min/max는 숫자·날짜 범위, pattern은 허용 형식을 검사합니다.
minlength나 pattern만으로 빈 값이 금지되지는 않고 email 형식 검사도 실제 주소 존재를 확인하지는 않습니다.
사용자가 조건과 고칠 방법을 글로 알 수 있게 안내하며 클라이언트 검사는 우회할 수 있어 서버가 값을 다시 검증해야 합니다.
disabled는 일반 제출·내장 검증·기본 키보드 초점에서 제외되지만 지원되는 readonly 입력은 수정할 수 없어도 일반 제출에는 포함되고 내장 검증에서는 제외됩니다.
GET은 주소의 질의 부분, POST는 요청 본문으로 데이터를 보내며 파일은 보통 POST와 multipart/form-data를 사용합니다.
POST 자체는 암호화가 아니며 예시 action 주소가 서버 저장 기능을 만들지는 않습니다.
label로 질문을 읽고 입력 요소가 받을 값과 name으로 보낼 이름을 확인한 뒤 type·required·길이 조건과 submit 버튼을 차례로 봅니다.
autocomplete은 입력 목적의 힌트이고 label/name을 대신하지 않습니다.
제출하지 않는 버튼에는 button을 명시하고 reset은 처음 값으로 돌아가 현재 작성을 잃을 수 있음을 구분합니다.
Tab·Shift+Tab, Space·화살표·Enter로 입력·선택·오류 확인·제출까지 사용하며 초점 표시와 순서도 확인합니다.
