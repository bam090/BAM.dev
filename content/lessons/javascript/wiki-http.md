# HTTP 요청·응답과 origin 경계

## 학습 목표

요청 메서드·응답 상태·본문·CORS의 역할을 구분해 성공과 읽기 가능 여부를 판단할 수 있습니다.

## 한줄 요약

HTTP 상태는 요청의 큰 결과를, 본문은 전달할 데이터를, CORS는 다른 origin 응답의 공유 가능 여부를 나타냅니다.

## 먼저 확인할 개념

[JSON 변환과 데이터 검증](#/learn/javascript/wiki-json)를 먼저 확인하면 이어지는 흐름을 읽기 쉽습니다.

## HTTP는 요청과 응답의 약속이다

HTTP(Hypertext Transfer Protocol)는 브라우저 같은 클라이언트와 서버가 요청과 응답을 주고받는 규칙이다.

| 메시지 | 들어 있는 것 |
| --- | --- |
| 요청 | 메서드, 대상 주소, 헤더, 필요할 때 본문 |
| 응답 | 상태 코드, 헤더, 필요할 때 본문 |

헤더는 본문 형식이나 캐시처럼 메시지를 설명하는 부가 정보이고, 본문은 실제로 보내는 데이터다.

## HTTP 메서드는 CRUD와 정확히 일대일로 같지 않다

CRUD는 Create, Read, Update, Delete, 곧 `만들기, 읽기, 고치기, 지우기`로 데이터 작업을 나눈 말이다.
HTTP 메서드와 자주 함께 설명하지만 같은 분류는 아니다.

| 메서드 | 기본 의미 |
| --- | --- |
| `GET` | 대상 자원의 현재 표현을 요청함 |
| `POST` | 대상 자원이 정한 방식으로 데이터를 처리해 달라고 요청함 |
| `PUT` | 대상 자원의 표현을 보내는 내용으로 만들거나 바꾸려는 요청 |
| `DELETE` | 대상 자원과 현재 기능의 연결을 제거하려는 요청 |

한 POST가 새 데이터를 만들 수도 있고 검색을 실행할 수도 있다.
서버 API가 정한 의미를 확인해야 한다.

## 상태 코드는 응답의 큰 결과를 알려 준다

HTTP 상태 코드는 세 자리 숫자로 응답의 종류를 알린다.

| 범위 | 뜻 |
| --- | --- |
| `100~199` | 처리 중 정보 |
| `200~299` | 성공 |
| `300~399` | 다른 응답으로 이어지는 리다이렉션 |
| `400~499` | 클라이언트 오류 |
| `500~599` | 서버 오류 |

상태 코드만 보고 본문이 항상 있다고 생각하면 안 된다.
예를 들어 `204 No Content`는 성공 응답이지만 읽을 본문이 없고 `HEAD` 응답도 본문을 보내지 않는다.

HTTP 성공은 응답 본문이 프로그램이 기대한 데이터라는 뜻도 아니다.
상태를 확인한 뒤 본문 형식과 데이터 모양을 다시 확인한다.

## origin은 통신 방식·호스트·포트로 구분한다

`https://example.com`과 `https://example.com:443`은 기본 HTTPS 포트를 사용하므로 같은 origin이다.
`http://example.com`은 통신 방식이 달라 다른 origin이다.
다른 origin의 API 응답을 브라우저 JavaScript에서 읽으려면 해당 서버의 응답 공유 규칙도 맞아야 한다.


## CORS는 권한 검사가 아니다

CORS(Cross-Origin Resource Sharing)는
`다른 origin의 응답을 현재 웹페이지 JavaScript에 공유해도 되는지` 서버가 알리는 규칙이다.

CORS에 실패하면 브라우저는 JavaScript가 응답을 읽지 못하게 하고 fetch에는 네트워크 오류처럼 보이는 실패를 전달한다.
일부 요청은 서버로 전송된 뒤 응답만 읽지 못할 수도 있다.

CORS는 로그인, 권한 확인, 서버 입력 검증을 대신하지 않는다.
`mode: "no-cors"`도 해결책이 아니며 상태와 본문을 읽을 수 없는 opaque Response를 받을 수 있다.
다른 origin의 API에는 서버의 올바른 CORS 헤더와 별도의 인증·권한 정책이 필요하다.

## 이어서 연습하기

[fetch 응답의 실패 경계](#/learn/javascript/wiki-fetch)에서 다음 판단을 이어 보세요.
이 문서의 핵심 질문에 답한 뒤 아래 객관식 문제에서 선택의 이유를 확인해 보세요.

## 공식 자료

- [ECMAScript 2026 — JSON Object](https://tc39.es/ecma262/2026/multipage/structured-data.html#sec-json-object)
- [WHATWG HTML Standard — Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html)
- [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/)

## 핵심 질문 답

요청은 메서드·주소·헤더·필요한 본문으로, 응답은 상태·헤더·필요한 본문으로 읽습니다. 메서드는 CRUD와 일대일이 아니며 API의 의미를 확인합니다. 204와 HEAD 응답은 본문이 없고 HTTP 성공도 데이터 모양을 보장하지 않습니다. CORS는 다른 origin의 응답을 JavaScript에 공유하는 규칙이며 인증·권한 확인을 대신하지 않습니다. no-cors로 바꿔도 opaque 응답의 상태·본문을 읽을 수 없습니다.
