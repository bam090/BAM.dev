# Code Quest 예제 가독성 개선

- 작업 ID: `2026-09-15-code-quest-example-readability`
- 유형: 일반 제품 기능·코드. 학습 콘텐츠 변경 성격 해당 없음.
- 사용자 문제: 입력과 반환값을 비교하기 어렵고 공개 사례의 큰 카드가 기본 읽기 흐름을 길게 만든다.
- 승인 범위: 기존 함수형 JS·Java 예제의 표시 개선. [설계 정본](../designs/code-quest.md#함수형-예제-가독성-개선)을 구현 전에 기록한다.
- 학습 경험: 기존 문제·예제·설명을 보존하는 UI 재배치이므로 새 A/E/C/T 카드 생성과 콘텐츠 재저작은 하지 않는다.

## 소유권과 순서

| 역할 | 소유·책임 | 완료·인계 조건 |
| --- | --- | --- |
| 총괄 Astra | 읽기 전용 범위·설계 확정, 역할 조정 | receipt를 검토하고 다음 역할에 인계 |
| `examples_research` | 공식 사이트 읽기 전용 조사 | 실제 관찰과 BAM 적용 제안을 구분 |
| `examples_design_docs` | 이 카드, `docs/designs/code-quest.md` 해당 절, `docs/README.md` 라우팅 한 줄 | 설계 선행 기록과 파일 hash 인계; 구현·검증 겸임 금지 |
| `examples_impl` | 총괄이 지정한 Quest 표시 제품 경로 | 수정 전 기준선/hash, 최소 표시 변경, focused 검사 receipt; 콘텐츠·저장·평가기 수정 금지 |
| 테스트 작성·독립 검증·문서 검토 | 총괄이 지정한 독립 역할과 focused 범위 | 작성자와 분리해 실제 결과·대상 hash·미실행 범위를 반환 |
| `project_integrator` | 읽기 전용 전체 diff·소유권·증거 확인 | 유효한 앞 단계 증거를 재사용하고 통합 판정 |

겹치는 파일은 선행 소유자 인계 후 순차 수정한다. 구현 경로와 기준선 증거는 구현 receipt로 식별하며 문서 담당이 중복 조사하지 않는다. 콘텐츠 원문·정답·ID·revision·공개 사례·저장·평가기, HTML·CSS 작성 예시는 변경 금지다. Java/JDK/Electron 실행·빌드·Git 변경 권한은 이 작업에 없다.

## 수용·검증 범위

1. 대표 함수형 JS와 Java ARR-01·ARR-02·QUE-01에서 계약의 이름·순서와 입력/반환값을 같은 행으로 비교한다. 기존 예제 설명은 해당 번호에 연결된다.
2. 빈 배열, 문자열 따옴표, null·boolean·객체와 Java의 반환 선언이 `long`인 기대값의 decimal string 표현이 정확하다. Java 매개변수는 현재 `int`·`int[]` 계약을 유지하며 지원 서명을 확장하지 않는다. 큰 배열은 앞 20개/전체 개수가 정확하고 전체 원본에 접근할 수 있다.
3. Java 공개 테스트의 실제 총개수와 열기 안내가 처음부터 보인다. 펼친 모든 입력·expected·observations 및 기존 큰 JSON 다운로드를 확인한다.
4. 1024px·1440px에서 기본 예제의 읽기 스크롤이 감소하고 반환값이 숨거나 페이지가 가로로 넘치지 않는다. 밝은/어두운 테마, 키보드 펼치기와 초점을 확인한다.
5. 기존 초안·힌트와 Java 실행 BLOCKED를 보존한다. 관련 focused 테스트와 대표 브라우저 smoke만 선정하고 전체 빌드·Java 실행은 하지 않는다.

오프라인 표시·기존 ID/URL/진도는 유지하고 마이그레이션은 없다. 모바일·설치 지원·실제 Java 채점은 미검증 한계로 남긴다. 독립 검증자는 실제 실행 명령·조건·대상 hash와 실행/재사용/미실행 범위를 구분한다.

## 출처와 설계 판단

`[현재 사실]` 2026-09-15 공식 프로그래머스 세 문제를 로그인 없이 Java 선택·1280×720 환경에서 확인했다. [배열 두 배 만들기](https://school.programmers.co.kr/learn/courses/30/lessons/120809)는 `numbers`/`result` 표와 번호별 설명, [같은 숫자는 싫어](https://school.programmers.co.kr/learn/courses/30/lessons/12906?language=java)는 `arr`/`answer` 표와 묶인 번호 설명, [다리를 지나는 트럭](https://school.programmers.co.kr/learn/courses/30/lessons/42583?language=java)은 매개변수별 네 열을 제공한다. 마지막 문제의 긴 배열에서는 반환값 열이 가로 스크롤 밖으로 숨는 한계도 관찰했다.

`[추론]` 입력과 결과를 같은 행에서 비교하는 구조를 참고하되 BAM은 실제 매개변수명·명시적 예제 번호와 반환값 가시성을 우선한다. 코드·장문 본문·디자인 자산은 복제하지 않는다. 상세 조사 receipt: `/tmp/quest-examples-research.md` (임시 실행 근거; 위 공식 링크와 관찰 요약을 이 카드에 보존).

## 실행·판정 기록

- 조사: 공식 세 화면의 실제 구조 확인 완료. 사용성 실험·로그인 후 실행·모바일·화면 낭독기 검증은 하지 않았다.
- 설계 문서: 구현 전 기록. 작성자 자체 확인은 독립 문서 검토 PASS를 대신하지 않는다.
- 제품 구현: 매개변수별 예제 표·번호별 설명·공개 테스트 접힘·배열 축약/원본 접근을 반영했다. 제품 view SHA256 `2875f3f1dce907d60c4b56390627fa9bb75b238c0d9aeced2503beb2bfb992ba`, `styles/app.css` SHA256 `6f01fc5d4b64681516080f7e0ead5ba1d6372f682195f13d5fae9bbc22e83f6f`를 총괄 인계 기준으로 기록한다.
- focused 테스트: 총괄이 인계한 `node --test tests/code-quest-view.test.js tests/app-code-quest-draft.test.js` 결과 26/26 PASS. `tests/code-quest-view.test.js` SHA256 `d101b60fb765db71bf0e0d88fbe5bdcd740a2c46f51987d9e92160f03018751e`. 최초 가상 Java `long` 매개변수 fixture 실패는 현재 지원 계약 밖의 테스트 오류였고 해당 fixture 제거 및 `long` 반환 기대값만의 표시 계약 명확화로 수정했다. 미래 Java 서명 지원을 제품 변경 범위에 추가하지 않았다.
- 최초 데스크톱 확인: 1440px 대표 Java 세 문제의 표 가독성은 PASS였으나 1024px의 264px 문제 패널·다섯 열에서 변수명이 단어 중간으로 줄바꿈되어 FAIL 반환했다. `styles/app.css`의 기존 `max-width: 1100px`에서 Quest workspace를 한 열로 바꾸는 한 줄 수정으로 읽기 폭을 확보했다. 후속 UI 검증은 아래 최종 receipt로 별도 판정한다.
- 독립 `test_engineer` 최종 판정: 위 최종 제품 hash에서 예제 가독성·공개 사례 표시 PASS. 근거 `/tmp/quest-example-desktop-receipt.md`, SHA256 `ea3328325d2065e8a2786b743e26ee1627cf51af6910e22e4a9ad0acf772f859`. macOS 14.8.3 arm64·Node 24.17.0, 기존 `http://127.0.0.1:4173`의 Chrome 및 저장소가 분리된 인앱 브라우저, 실제 1024×900·1440×900에서 확인했다.
- 수정 후 1024px ARR-01은 표 폭 682px, 다섯 머리글 높이 36px 한 줄로 표시됐다. 예제 영역은 최초 구현 463.19px에서 370.39px로 92.8px 짧아졌다. 이는 이번 반환 전후 예제 영역 측정이며 전체 페이지나 작업 전 기준선의 정밀한 스크롤 감소율을 뜻하지 않는다. 반환값 가시성과 페이지 가로 overflow 없음, 문제 다음 편집기 한 열 흐름을 확인했다.
- 실제 대표 확인: 1440px Java ARR-01·ARR-02·QUE-01, Java long 반환 pilot, JS 문자열·객체의 타입 표시와 HTML 기존 작성 예시 보존. 어두운 테마 1024px·1440px와 밝은 테마 1440px에서 표/반환값·공개 테스트 기본 접힘·실행 비활성을 확인했다. native details의 Space 열기·SUMMARY 초점/outline, 실제 공개 사례 6개, 작은 원본 JSON의 args·expected·observations, 100000개 배열의 정확한 전체 개수·20개 preview·다운로드 접근을 확인했다.
- 증거 재사용: 독립 검증자는 위 26/26 focused 결과를 감사하고 반복 실행하지 않았다. 기존 `/private/tmp/bam-algorithm-bridge-test-engineer-final-receipt.md`의 초안·힌트·저장·Java guard·실제 다운로드 deep-equality 증거를 재사용했다. 해당 receipt SHA256 `59e70b22d5de2439ea28e464648e9a0cac8752945aae82278f4eb20f16e034e7`; `src/app.js` SHA256 `413b0caa368ccbbd13a655e7df4f133dad4ce155da5a1892ab4f1eac40acdc08`과 Java 콘텐츠 SHA256 `f2236ffa379b332d5e3af0dec093e9eec4e99be304c9b9310f28d53bc4542e37` 불변이 근거다. 실제 다운로드 클릭·새 파일 생성은 이번 UI 검사에서 반복하지 않았다.
- 미실행: Java/JDK·실제 채점·격리·프로세스 종료, Electron·설치 앱·빌드·패키징, 모바일·화면 낭독기·다른 OS·사용성 실험. 접근성 판정은 실제 키보드와 AX 확인 범위다.
- 인수 경계: 이 기록은 담당 receipt의 문서 반영이며 작성자의 최종 승인 선언이 아니다. 독립 문서 검토와 `project_integrator`의 최종 인수는 이 문서 hash 및 위 제품·테스트 증거를 기준으로 별도 판정한다. 그 인수 결과를 기록하기 위해 제품 검사나 이 카드 갱신을 반복하지 않는다.
- Java 실제 실행: 기존 BLOCKED 유지. 이번 표시 개선으로 해제하지 않는다.
