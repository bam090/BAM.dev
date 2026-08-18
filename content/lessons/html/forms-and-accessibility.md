# 04. 폼과 기본 접근성

## 학습 목표

- 폼이 제출 가능한 컨트롤의 이름과 값을 모아 요청을 구성하는 흐름을 설명할 수 있습니다.
- `action`, `method`, `id`, `name`, `value`의 역할을 구분할 수 있습니다.
- 입력 목적에 맞는 `input` 유형, `textarea`, `select`, 버튼을 선택할 수 있습니다.
- `label`과 입력 요소, `fieldset`과 `legend`를 올바르게 연결할 수 있습니다.
- HTML 내장 검증과 서버 검증의 역할을 구분할 수 있습니다.
- 링크와 버튼을 구분하고 키보드로 폼의 기본 동작을 확인할 수 있습니다.

## 55분 학습 순서

1. 5분: `id`만 있는 입력과 `name`이 있는 입력을 비교합니다.
2. 12분: 폼 제출의 `action`, `method`, 이름·값 흐름을 이해합니다.
3. 13분: 목적에 맞는 폼 컨트롤을 선택합니다.
4. 12분: 레이블과 관련 입력 그룹을 연결합니다.
5. 8분: 내장 검증과 서버 검증의 경계를 확인합니다.
6. 5분: 키보드로 직접 점검합니다.

## 먼저 관찰하기

```html
<form action="/register" method="post">
  <label for="email">이메일</label>
  <input type="email" id="email" required />
  <button type="submit">가입하기</button>
</form>
```

화면에는 이메일 입력란이 보이고 레이블도 연결되어 있습니다. 하지만 입력 요소에 `name`이 없으므로 일반적인 폼 제출 데이터에서 이 값의 이름을 만들 수 없습니다. 화면 표시, 접근 가능한 이름, 제출 데이터는 서로 연결되지만 같은 역할은 아닙니다.

## 폼 제출의 기본 구조

```html
<form action="/register" method="post">
  <label for="email">이메일</label>
  <input type="email" id="email" name="email" required />

  <button type="submit">가입하기</button>
</form>
```

- `form`: 관련된 입력과 제출 방식을 묶습니다.
- `action`: 제출 요청을 처리할 URL입니다.
- `method`: 폼 제출에 사용할 HTTP 메서드입니다. 일반적으로 `get` 또는 `post`를 사용합니다.
- `id`: 문서 안에서 요소를 식별하고 `label` 등 다른 요소와 연결할 때 사용합니다.
- `name`: 제출 데이터에서 값의 이름이 됩니다.
- `value`: 텍스트 입력처럼 편집 가능한 `input`에 HTML 속성으로 작성하면 초기값을 정합니다. 사용자가 편집하면 DOM의 `value` 속성이 나타내는 현재 값은 이 초기값과 달라질 수 있으며, 일반적인 폼 제출에는 현재 값이 사용됩니다. 체크박스와 라디오 버튼에서는 선택되었을 때 제출할 값을 정합니다.
- `button type="submit"`: 폼 제출을 시작합니다.

위 입력에 `bam@example.com`을 입력하면 제출 데이터에는 개념적으로 다음 이름·값 항목이 만들어집니다.

```text
email=bam@example.com
```

모든 폼 컨트롤이 제출되는 것은 아닙니다. 예를 들어 `name`이 없거나 비활성화된 컨트롤, 선택되지 않은 체크박스·라디오 버튼은 일반적인 제출 데이터에 포함되지 않습니다.

## GET과 POST 구분하기

조회 조건을 보내는 검색 폼에는 GET이 자주 사용됩니다.

```html
<form action="/search" method="get">
  <label for="keyword">검색어</label>
  <input id="keyword" name="q" />
  <button type="submit">검색</button>
</form>
```

검색어가 `html`이면 URL은 개념적으로 `/search?q=html`과 같은 쿼리를 포함할 수 있습니다.

```html
<form action="/questions" method="post">
  <!-- 작성할 질문 입력 -->
</form>
```

POST는 글 작성이나 회원가입처럼 요청 본문으로 데이터를 보내는 작업에 자주 사용됩니다. 하지만 POST라는 이유만으로 데이터가 암호화되지는 않습니다. 전송 구간 보호에는 HTTPS가 필요하며, 서버는 요청 목적과 관계없이 입력을 다시 검증해야 합니다.

## 목적에 맞는 컨트롤 고르기

```html
<label for="nickname">닉네임</label>
<input
  type="text"
  id="nickname"
  name="nickname"
  autocomplete="nickname"
/>

<label for="email">이메일</label>
<input
  type="email"
  id="email"
  name="email"
  autocomplete="email"
/>

<label for="password">비밀번호</label>
<input
  type="password"
  id="password"
  name="password"
  autocomplete="new-password"
/>

<label for="bio">자기소개</label>
<textarea id="bio" name="bio"></textarea>

<label for="track">학습 트랙</label>
<select id="track" name="track">
  <option value="frontend">프론트엔드</option>
  <option value="backend">백엔드</option>
</select>
```

입력 목적에 맞는 유형은 브라우저의 기본 형식 검사와 모바일 키보드 선택 등에 도움을 줄 수 있습니다. `autocomplete`은 해당 값이 이메일, 닉네임, 새 비밀번호 중 무엇인지 브라우저가 이해하고 알맞은 자동 완성을 제공하도록 돕는 힌트입니다. 로그인 비밀번호라면 `current-password`, 새로 만들 비밀번호라면 `new-password`처럼 실제 목적에 맞는 토큰을 선택합니다.

`option`의 `value`는 그 선택지가 선택되었을 때 제출할 값입니다. 위 예제에서 화면에 보이는 “프론트엔드”를 선택하면 `track=frontend`가 제출됩니다. `option`에 `value` 속성을 생략하면 그 선택지의 텍스트가 값으로 사용됩니다.

여러 줄의 자유로운 글은 `textarea`, 정해진 선택지 중 하나를 고르는 입력은 상황에 따라 `select`나 라디오 버튼을 검토합니다.

### 라디오 버튼과 체크박스

하나만 선택해야 하는 라디오 버튼은 같은 `name`으로 그룹을 만듭니다.

```html
<fieldset>
  <legend>알림 수신 방법</legend>

  <label>
    <input type="radio" name="notification" value="email" />
    이메일
  </label>

  <label>
    <input type="radio" name="notification" value="sms" />
    문자
  </label>
</fieldset>
```

서로 독립적으로 여러 개를 고를 수 있다면 체크박스를 사용합니다.

```html
<fieldset>
  <legend>관심 분야</legend>
  <label><input type="checkbox" name="interest" value="html" /> HTML</label>
  <label><input type="checkbox" name="interest" value="css" /> CSS</label>
</fieldset>
```

`fieldset`은 관련 컨트롤을 하나의 그룹으로 묶고 `legend`는 그 그룹의 질문이나 이름을 제공합니다.

## 레이블은 placeholder를 대신하지 않습니다

```html
<label for="user-email">이메일 주소</label>
<input
  type="email"
  id="user-email"
  name="email"
  placeholder="bam@example.com"
/>
```

`label`의 `for`와 입력 요소의 `id`가 정확히 같으면 두 요소가 명시적으로 연결됩니다.

- 입력 목적을 화면과 보조 기술에 전달합니다.
- 레이블을 눌러도 연결된 입력을 활성화할 수 있어 조작 영역이 넓어집니다.
- 음성 입력 사용자가 보이는 레이블을 기준으로 컨트롤을 지칭할 수 있습니다.

placeholder는 입력을 시작하면 사라질 수 있고 예시나 짧은 힌트를 보여 주는 용도입니다. 지속적으로 보여야 하는 입력 이름을 대신하지 않습니다.

## 버튼 유형과 링크 구분하기

```html
<button type="submit">저장</button>
<button type="button">미리보기</button>
<button type="reset">초기화</button>
```

폼 안에서 `button`의 `type`을 생략하면 제출 버튼으로 동작할 수 있습니다. 제출하지 않는 JavaScript 동작이라면 `type="button"`을 명시합니다. `reset`은 모든 값을 무조건 비우는 기능이 아니라 각 폼 컨트롤을 HTML에 정해 둔 초기 기본값으로 복원합니다. 초기값이 비어 있으면 입력이 지워진 것처럼 보이며, 어느 경우든 사용자가 변경한 현재 값은 사라질 수 있으므로 실제 필요성과 복구 가능성을 고려합니다.

- 다른 위치로 이동: `a`와 `href`
- 현재 화면에서 동작 실행: `button`

`div onclick="..."`로 버튼을 흉내 내면 키보드 활성화, 포커스, 역할을 직접 다시 구현해야 합니다. 먼저 목적에 맞는 네이티브 요소를 선택합니다.

## HTML 내장 검증과 서버 검증

```html
<label for="username">아이디</label>
<input
  type="text"
  id="username"
  name="username"
  minlength="4"
  maxlength="20"
  required
/>

<label for="age">나이</label>
<input type="number" id="age" name="age" min="14" max="120" />
```

- `required`: 값이 비어 있는지 검사합니다.
- `minlength`, `maxlength`: 문자열 길이 범위를 정합니다.
- `min`, `max`, `step`: 숫자·날짜 등의 허용 범위를 정합니다.
- `type="email"`: 이메일 입력에 맞는 기본 형식 검사를 제공합니다.
- `pattern`: 필요한 경우 추가 문자열 형식을 정의합니다.

브라우저는 조건을 만족하지 않는 일반 제출을 막고 사용자에게 안내할 수 있습니다. 그러나 사용자는 개발자 도구나 별도의 HTTP 요청으로 이 검사를 우회할 수 있습니다. 내장 검증은 빠른 사용자 피드백을 위한 첫 검사이며 보안 경계가 아닙니다. 서버는 항상 자신이 신뢰할 수 있는 규칙으로 입력을 다시 검증합니다.

## 키보드로 직접 확인하기

1. Tab과 Shift+Tab으로 링크, 입력, 버튼 사이를 이동합니다.
2. 텍스트 입력란에 값을 입력합니다.
3. Space로 체크박스를 바꾸고 방향키로 라디오 그룹과 `select` 선택지를 이동합니다.
4. Enter 또는 Space로 해당 컨트롤의 기본 동작을 확인합니다.
5. 레이블을 눌렀을 때 연결된 입력이 활성화되는지 확인합니다.
6. 필수 입력을 비운 채 제출하여 브라우저 안내를 확인합니다.

자동 검사만으로 실제 키보드 흐름이나 안내 문구의 이해 가능성을 모두 판단할 수 없으므로 직접 조작을 함께 수행합니다.

## 흔한 혼동

- `id`가 있으니 값도 제출된다고 생각하고 `name`을 빠뜨립니다.
- `label for`와 컨트롤 `id`를 다르게 작성합니다.
- placeholder만 제공하고 보이는 레이블을 생략합니다.
- 같은 라디오 그룹에 서로 다른 `name`을 줍니다.
- 제출하지 않는 버튼의 `type`을 생략합니다.
- POST가 데이터를 자동으로 암호화한다고 생각합니다.
- 브라우저 내장 검증을 통과하면 서버 검증이 필요 없다고 생각합니다.
- 클릭 이벤트가 있다는 이유만으로 `div`를 버튼처럼 사용합니다.

## 확인 문제

1. `id`와 `name`은 각각 어떤 관계와 데이터를 만드는 데 사용되나요?
2. 같은 라디오 그룹의 선택지들이 공유해야 하는 속성은 무엇인가요?
3. `label for="email"`과 연결될 컨트롤에는 어떤 속성과 값이 필요하나요?
4. 폼 안에서 제출하지 않는 “미리보기” 버튼에 `type="button"`을 써야 하는 이유는 무엇인가요?
5. `required`와 `type="email"` 검사를 통과해도 서버 검증이 필요한 이유를 설명해 보세요.
6. GET 검색 폼과 POST 글쓰기 폼에서 데이터가 전달되는 위치의 기본 차이를 설명해 보세요.

## 공식 자료

- [WHATWG HTML Standard: 폼](https://html.spec.whatwg.org/multipage/forms.html)
- [WHATWG HTML Standard: 폼 컨트롤 기반과 제출 데이터](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html)
- [WHATWG HTML Standard: 입력 요소](https://html.spec.whatwg.org/multipage/input.html)
- [W3C WAI: 폼 컨트롤 레이블 연결](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C WAI: 폼 그룹화](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [W3C WAI: 키보드와 폼을 포함한 기초 접근성 점검](https://www.w3.org/WAI/test-evaluate/preliminary/)

공식 자료 확인일: 2026-08-18
