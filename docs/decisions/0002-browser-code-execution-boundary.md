# ADR 0002: 공개 JavaScript Quest는 테스트별 Web Worker로 실행한다

- 상태: 채택
- 날짜: 2026-08-17

## 맥락

3차 JavaScript Code Quest는 외부 서버 없이 브라우저에서 공개 테스트를 실행해야 합니다. 정상 결과와 오답뿐 아니라 문법 오류, 런타임 오류, 시간 초과와 출력 초과를 구분해야 하며 이전 실행의 상태가 다음 테스트에 남아서는 안 됩니다.

실행기는 특정 문제 내용과 분리된 포트로 설계하고, 실제 Quest의 함수·입출력·공개 테스트는 언어별 정적 콘텐츠 계약으로 연결합니다. 자동 테스트의 런타임 fixture는 엔진 경계를 검증하기 위한 합성 코드이고, Quest별 기준 풀이와 대표 오답 fixture는 콘텐츠·공개 테스트의 독립 검증에만 사용하며 빌드 결과에는 포함하지 않습니다.

## 결정

화면이 의존할 경계는 다음 비동기 포트입니다.

```js
runner.run(request, { signal }) -> Promise<GradeReport>
```

요청에는 안정적인 실행·Quest ID, 계약 버전과 Quest revision, `javascript` 언어, `public` suite, 사용자 소스, 함수 진입점과 JSON 호환 공개 테스트가 포함됩니다. 결과에는 전체 상태, 테스트별 상태, 예상값·실제값과 표시 문자열, 오류, 실행 시간과 실제 적용 제한이 포함됩니다.

브라우저 구현은 공개 테스트마다 새로운 one-shot module Worker를 만들고 모든 종료 경로에서 Worker를 종료합니다. Worker entry의 자동 listener는 실제 `DedicatedWorkerGlobalScope`에서만 등록하므로 같은 모듈을 Window 문맥에서 import해도 사용자 코드를 주 실행 문맥에서 실행하지 않습니다. Worker는 사용자 소스를 컴파일하고 함수 호출·Promise 완료를 기다린 뒤 제한된 실제값과 console 기록만 반환합니다. 기대값 비교와 결과 집계는 메인 실행 어댑터에서 수행합니다.

사용자 소스는 strict FunctionBody로 실행하되, 먼저 캡처한 native direct `eval`로 strict Script 전체를 파싱합니다. 검사 문자열의 첫 문장은 literal sentinel을 던지므로 문법이 유효한 소스도 검사 단계에서는 실행되지 않으며, 별도 block wrapper가 없어 소스가 검사 문맥을 닫고 탈출할 수 없습니다. 이 검사로 진입점 확인을 우회하는 최상위 `return`을 `syntax_error`로 거부하면서 문자열·템플릿·주석·중첩 함수의 `return`, FunctionBody에서 유효한 `arguments`와 `var await`은 허용합니다.

검증이 끝난 실행 요청은 descriptor 기반으로 복제하고 재검증한 뒤 깊게 동결합니다. 모든 필수 필드는 own enumerable data property여야 하고 선택 필드도 존재한다면 같은 조건을 충족해야 합니다. getter·setter와 상속값은 읽거나 실행하지 않으며, record 사본은 null prototype으로 만들어 동결 뒤 prototype 변경의 영향도 받지 않습니다. 검증·복제·크기 계산에는 모듈 로드 시 캡처한 intrinsic과 descriptor 기반 JSON 직렬화를 사용하며 실행 중에는 호출자가 제공한 원본 요청을 다시 읽지 않습니다. Worker로 들어오는 실행 envelope과 나오는 결과도 각각 정확한 필드와 own data property를 검사합니다. 결과는 outcome별 고정 DTO, JSON 값, console·오류·제한 크기를 확인한 뒤 복제한 사본만 채점합니다. 메인 문맥의 결과 크기 확인도 ambient `JSON.stringify`나 `toJSON`을 사용하지 않습니다. malformed `execute`는 one-shot 실행권을 소비하지 않고 malformed 결과는 `invalid_worker_result` engine error로 거부합니다.

Worker 모듈이 로드될 때 채점 후처리에 필요한 내장 함수와 전송 함수를 먼저 캡처합니다. 학습자 코드가 같은 Worker의 `JSON`, `Object`, `Array`, `Number`, `Math`, `Reflect`, `structuredClone`, `TextEncoder` 또는 `postMessage` 같은 mutable global을 바꾸더라도 반환값 정규화, 출력 제한과 결과 envelope에는 캡처한 참조만 사용합니다. 함수 호출은 캡처한 `Reflect.apply`로 수행해 `Array` iterator 변조가 승인된 인수를 바꾸지 못하게 합니다. 실행기 결과와 전송 envelope은 null-prototype record로 만들어 inherited setter와 `Object.prototype.then` 변조도 피합니다. 직접 `console`, `globalThis.console`과 `self.console`로 접근하는 일반 경로는 같은 제한 캡처로 연결합니다.

비동기 완료는 캡처한 `Promise.prototype.then`의 내부 Promise brand 검사를 통과한 실제 Promise에만 적용합니다. 동기 함수가 반환한 일반 객체는 상속되거나 own property인 callable `then`이 있어도 thenable로 실행하지 않습니다. JSON 호환 `then` 값은 일반 데이터로 보존하고, 함수형 `then`은 다른 함수 반환값과 동일하게 JSON 비호환 `output_limit`으로 처리합니다.

- 동적 컴파일 단계의 `SyntaxError`: `syntax_error`
- 함수 준비·호출 중 예외와 Promise 거부: `runtime_error`
- 실행은 끝났으나 값이 다름: `wrong_answer`
- 메인 문맥의 제한 시간 안에 응답하지 못해 Worker 종료: `timeout`
- 반환값 또는 console 제한 초과: `output_limit`
- 명시적 중단: `cancelled`
- Worker 시작·프로토콜 문제와 CSP 등 동적 컴파일 capability 실패: `engine_error`
- 앞선 중단으로 실행하지 않음: `not_run`

입출력은 유한한 숫자를 포함하는 순환 없는 JSON 값으로 제한합니다. 한 경로의 컨테이너는 루트를 깊이 0으로 세어 총 512단계까지 허용합니다. 크기는 UTF-8 compact JSON을 기준으로 하며, 같은 객체를 여러 위치에서 참조하는 alias/DAG는 직렬화될 각 위치의 확장 바이트를 모두 더합니다. descriptor 기반 검증은 실제 객체 그래프를 한 번씩 확인하고, 확장 크기 계산은 한도를 넘는 즉시 `limit + 1`에서 중단합니다. 객체 비교는 키 순서와 관계없이 재귀적으로 수행하고 배열 순서는 보존합니다.

## 기본 자원 제한

승인 계약에 별도 수치가 없는 동안 다음 기본값을 한 곳에서 관리합니다.

| 자원 | 기본값 |
| --- | ---: |
| 사용자 소스 | UTF-8 20 KiB |
| 공개 테스트 수 | 실행당 20개 |
| 입력 | 테스트당 16 KiB |
| 반환값 | 테스트당 16 KiB |
| JSON 컨테이너 깊이 | 경로당 512단계 |
| console | 테스트당 100개·8 KiB |
| 테스트 실행 시간 | 1,000 ms |
| 전체 실행 시간 | 5,000 ms |
| 동시 실행 | runner 인스턴스당 1개 |
| 반복 실행 | 60초당 20회 |

크기·개수와 반복 제한은 Worker 생성 전에 확인합니다. 반환값은 alias를 보존한 안전 사본을 만든 뒤 확장 크기를 다시 확인하고, 한도 안일 때만 native JSON 직렬화를 수행합니다. console도 남은 바이트 예산 안에서 인수별로 미리 제한하여 큰 중간 문자열을 만들지 않습니다. 시간 제한은 사용자 코드가 막을 수 없는 메인 문맥 타이머와 `terminate()`로 적용합니다. 전체 실행 제한이 끝나면 남은 테스트는 실행하지 않습니다. 실행 ID, 테스트 ID와 Worker 토큰이 다른 메시지는 무시합니다.

## 실행 흐름

1. 요청 형식과 소스·테스트·입력 제한을 검증합니다.
2. descriptor 기반 요청 사본을 만들고 재검증·동결합니다.
3. 공개 테스트 하나를 위한 새 Worker와 메인 타이머를 만듭니다.
4. Worker가 캡처된 `structuredClone`으로 인수를 복제한 뒤 사용자 함수를 실행합니다.
5. 캡처된 내장 함수로 실제값과 console을 제한하고 캡처된 전송 함수로 메인 문맥에 보냅니다.
6. 메인 문맥이 outcome별 Worker DTO를 검증·복제한 뒤 예상값과 비교합니다.
7. 타이머·이벤트 수신기를 정리하고 Worker를 종료한 뒤 다음 테스트를 새 Worker에서 시작합니다.

새 Worker를 사용하므로 사용자 코드가 만든 전역 변수나 변경한 내장 객체는 다음 테스트·실행에서 이어지지 않습니다. 인수도 복제하여 테스트 계약의 값을 사용자 코드가 바꾸지 못하게 합니다.

`Date`, `Math`, `Promise`, `Object`, `Array` 같은 mutable global의 변경은 해당 학습자 함수 자체의 동작에는 영향을 줄 수 있습니다. 다만 채점 후처리는 모듈 로드 시 캡처한 참조만 사용하고, Worker는 한 테스트를 마치면 닫히므로 그 변경이 다음 테스트의 채점 후처리나 실행 상태로 전파되지는 않습니다.

## 보안 경계와 한계

Web Worker는 완전한 보안 샌드박스가 아닙니다. DOM과 애플리케이션 주 실행 문맥의 동기 실행은 분리하지만 다음 위험은 남습니다.

- 같은 브라우저 프로세스의 CPU와 메모리를 사용하므로 큰 메모리 할당은 시간 제한 전에 탭이나 기기에 영향을 줄 수 있습니다.
- Worker 전역의 네트워크·저장소 API 접근을 완전히 차단하지 않습니다. 같은 출처에 민감한 쿠키나 권한 API가 생기면 이 실행 경계를 신뢰할 수 없습니다.
- 캡처한 내장 함수와 전역 console 교체는 채점 후처리와 일반 console 경로를 강화하지만, constructor escape, 새 Worker·동적 import, 브라우저별 전역 prototype 경로까지 capability 수준으로 차단하지 않습니다.
- 시간, 난수, locale과 브라우저 구현에 의존하는 코드는 완전히 재현 가능하지 않습니다.
- 브라우저에 전달한 문제와 공개 테스트, 제한과 결과는 개발자 도구로 확인·변조할 수 있습니다. 비밀 테스트, 비밀키와 서버 권한을 포함하지 않습니다.
- 동적 컴파일은 엄격한 CSP에서 `unsafe-eval` 없이 동작하지 않으며, 이 경우 학습자 런타임 오류가 아닌 실행기 capability 오류로 반환합니다.
- 횟수·크기 제한은 우발적인 과소비를 줄일 뿐 인증·등급·보상 같은 권한 판단의 보안 통제가 아닙니다.

따라서 현재 결과는 로컬 학습 피드백에만 사용합니다.

## 서버 채점 전환

향후 서버 구현도 `run(request, { signal })`과 `GradeReport`의 의미를 유지합니다. 서버는 클라이언트가 보낸 테스트·예상값을 신뢰하지 않고 `questId`와 `questRevision`으로 승인된 계약을 조회해야 합니다. Worker 프로토콜은 어댑터 내부 세부이므로 UI 변경 없이 원격 실행 어댑터로 교체할 수 있습니다.

서버 실행기는 프로세스 또는 컨테이너 격리, CPU·메모리·네트워크·파일시스템 제한, 서버가 보관하는 정식 테스트와 감사 가능한 실행 기록을 추가해야 합니다.

## 결과

- 무한 반복은 애플리케이션 주 실행 문맥을 직접 막지 않으며 제한 시간 뒤 종료할 수 있습니다.
- 테스트별 초기화와 결과 분류를 자동 테스트로 재현할 수 있습니다.
- Worker 시작 비용과 동적 컴파일의 CSP 비용이 생깁니다.
- 실제 Quest의 함수명·입력 범위·공개 테스트·기준 풀이가 실행기와 별도 계약으로 검증되므로, 문제를 추가하거나 revision을 올릴 때 실행기 변경 없이 콘텐츠 검증을 반복할 수 있습니다.
