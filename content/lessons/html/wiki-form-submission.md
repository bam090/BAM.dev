# 폼 제출: 보내는 값과 GET·POST 방식

## 학습 목표

폼 상태에 따라 제출에서 빠지는 값을 구분하고 GET·POST·파일 전송 설정을 설명할 수 있습니다.

## 한줄 요약

폼은 제출 가능한 이름·값을 정해진 방식으로 보내며 입력 상태와 method·enctype은 서로 다른 제출 조건을 정합니다.

## 먼저 확인할 개념

[입력의 레이블과 제출 이름](#/learn/html/wiki-input-names), [폼 컨트롤: 값과 선택에 맞는 입력 고르기](#/learn/html/wiki-form-controls)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

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

## `disabled`와 `readonly`는 다르다

| 상태 | 사용자가 바꿀 수 있는가 | 일반 제출에 포함되는가 | 내장 검증 대상인가 | 기본 키보드 초점을 받는가 |
| --- | --- | --- | --- | --- |
| `disabled` | 아니요 | 아니요 | 아니요 | 아니요 |
| `readonly` | 아니요 | 예 | 아니요 | 적용 가능한 입력에서는 예 |

수정을 막되 서버에는 값을 보내야 하는 입력에 `disabled`를 쓰면 값이 빠질 수 있다.
`readonly`는 모든 입력 타입에 적용되는 속성도 아니므로 해당 입력이 지원하는지 확인한다.
CSS로 회색을 칠하는 것만으로 이 상태가 생기지는 않는다.

## GET·POST와 파일 전송의 입문 구분

- GET 폼은 제출 값을 주소 끝의 `?name=value` 같은 질의 부분에 붙인다. 검색처럼 결과 주소를 저장하거나 공유하기 좋은 조회에 자주 사용한다. 비밀값을 보내는 방법으로 사용하지 않는다.
- POST 폼은 제출 데이터를 요청 본문에 담아 보낸다. 서버 상태를 바꾸거나 큰 데이터를 보낼 때 자주 사용하지만, POST 자체가 암호화 기능은 아니다.
- 전송 내용을 보호하려면 HTTPS 같은 별도 수단이 필요하다.
- 파일을 보내는 폼은 일반적으로 `method="post"`와 `enctype="multipart/form-data"`를 사용한다. `enctype`은 제출 데이터를 어떤 형식으로 묶을지 정한다.

```html
<form action="/club-files" method="post" enctype="multipart/form-data">
  <label for="reading-note">독서 메모 파일</label>
  <input id="reading-note" name="readingNote" type="file">
  <button type="submit">파일 보내기</button>
</form>
```

GET과 POST를 조회·생성·수정·삭제 동작과 정확히 일대일로 같은 개념이라고 외우지 않는다.

## 이어서 연습하기

입력 상태와 GET·POST·파일 전송을 직접 검증하는 실습은 아직 제공하지 않습니다. 다음 신청 폼 문서에서 제출할 이름·값과 입력 흐름을 함께 읽습니다.

## 공식 자료

- [WHATWG HTML — Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG 2.2 — Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions)

## 핵심 질문 답

disabled는 일반 제출·내장 검증·기본 키보드 초점에서 제외되지만 지원되는 readonly 입력은 수정할 수 없어도 일반 제출에는 포함되고 내장 검증에서는 제외됩니다.
GET은 주소의 질의 부분, POST는 요청 본문으로 데이터를 보내며 파일은 보통 POST와 multipart/form-data를 사용합니다.
POST 자체는 암호화가 아니며 예시 action 주소가 서버 저장 기능을 만들지는 않습니다.
