# JavaScript·Spring 교안의 공동 로컬 통합

`[확정 결정]` 작업 ID는 `JS-SPRING-LOCAL-INTEGRATION-20261003`입니다.
각각 독립 PASS를 받은 JavaScript·Spring 교안 통합 결과를 같은 로컬 작업본에 합치고 합쳐진 부분의 영향을 독립 검증합니다.
학습 콘텐츠 통합 작업이며 새 교육 내용을 작성하거나 기존 승인 범위를 넓히지 않습니다.
기준선은 최신 `dev`인 `02c363f473a92e8f1b21820cc199ae68e3848e24`이고 작업 브랜치는 `codex/js-spring-integration-review`입니다.
이번 승인은 로컬 통합에 한정하며 commit·push·PR·merge·배포를 하지 않습니다.

## 입력과 보존

- JavaScript 입력은 13개 파일이며 원 작업본 상위의 `javascript-final-integration-receipt.json`과 `javascript-final-integration-report.txt`에서 최종 로컬 PASS를 인수합니다.
- Spring 입력은 26개 파일이며 `/tmp/spring-integration-final.json`과 `/tmp/spring-integration-final.md`에서 최종 로컬 PASS를 인수합니다.
- `/tmp/bam-js-spring-preflight.json`은 두 입력의 기준선과 파일 해시 일치를 확인한 반입 전 기록입니다. 합친 작업본의 검증 결과가 아닙니다.

[JavaScript 원 카드](2026-10-02-javascript-lesson-integration.md)와 [Spring 원 카드](2026-10-03-spring-document-consolidation.md)는 각 최종 receipt에 고정된 바이트 그대로 보존합니다.
원 카드에 남은 통합 대기 문장은 작성 당시 상태이며 위 최종 receipt에서 후속 PASS가 확인됐습니다.
원 snapshot의 JSON·README·공용 테스트 해시는 과거 입력의 증거로 유지하고 공동 통합본의 새 해시와 구분합니다.
동결 본문 24개와 원 카드 2개의 바이트가 유지될 때만 해당 내용 검토를 재사용합니다.

## 소유권과 순서

| 담당 | 허용 경로와 처리 |
| --- | --- |
| 본문·원 카드 반입 담당 | JavaScript 본문 6개·Spring 본문 18개와 원 카드 2개를 동결 입력 그대로 복사합니다. 교육 내용을 고치지 않습니다. |
| 공용 JSON 단일 작성자 | `content/curriculum.json`·`content/review-concepts.json`에서 각 원본과 기준선의 ID별 필드 변경만 합칩니다. 다른 과정·문항 소유·안정 ID·URL·진도를 보존합니다. |
| 테스트 단일 작성자 | `javascript-lesson-integration`·`js-java-concept-lessons`·`learning-catalog-view`·`extension-content`·`lesson-answer`·`spring-document-consolidation`의 `.test.js` 6개를 합칩니다. 두 입력이 겹치는 `learning-catalog-view`는 한 작성자가 양쪽 기대값을 반영합니다. |
| Astra 문서 작성자 | JSON 동결 뒤 `README.md` 수량과 이 카드만 수정합니다. 예상 수량은 JavaScript 30·Spring 34·전체 145이며 실제 JSON으로 검산합니다. |
| 독립 검증·통합 담당 | 합침 영향 검사와 원 증거의 유효성을 확인합니다. README는 별도 Astra 검토자가 검토하며 작성자가 최종 승인하지 않습니다. |

공용 파일은 앞 작성자의 동결 인계를 받은 뒤 다음 역할이 읽고 수정합니다.
등록 문항 382개와 문항 본문·제품 코드·실행·저장·의존성·빌드 설정·원 자료는 변경하지 않습니다.

## 검증과 현재 상태

`[현재 사실]` 공동 작업본의 반입과 공용 파일 병합을 마쳤으며 독립 검증과 README의 독립 Astra 검토 PASS를 인수했습니다.
활성 145편·보관 68편·등록 213편 중 JavaScript 활성 30편·Spring 활성 34편을 확인했습니다.
동결 본문 24개의 바이트와 객관식 382문항의 바이트, 기존 ID·경로·순서와 대상 밖 metadata를 보존했습니다.

이번 독립 검증은 선정 검사 34개를 새로 실행해 34 PASS·0 FAIL을 확인했습니다(`/tmp/bam-js-spring-independent.log`).
작성자의 26개 검사 결과를 이번 독립 실행 결과로 대신하지 않았습니다.
JavaScript 테스트의 전역 기대 해시 2개는 승인된 Spring 최종 입력 JSON의 receipt를 대조한 뒤 JavaScript의 허용 필드를 정규화하여 독립 계산했습니다.
승인된 두 변경의 합집합을 반영한 것이며 대상 밖 보존 검사를 약화하지 않았습니다.

실제 Chrome에서 JavaScript·Spring의 옛 문서를 완료해도 대표 문서는 자동 완료되지 않는 것을 확인했습니다.
각 과정의 대표 문서→원래 소유 교안의 문제→관련 개념→대표 문서→같은 문제 왕복과 JavaScript 69·Spring 92·전체 382문항 진입이 PASS입니다.
브라우저 증거는 `/tmp/bam-js-spring-browser.json`에 있으며 Spring 왕복의 최종 증거는 `/tmp/bam-js-spring-spring-roundtrip.json`입니다.
초기에 JavaScript 링크를 잘못 선택한 관찰은 Spring 왕복 PASS 근거에서 제외했습니다.
검증용 Chrome과 서버는 종료했습니다.

원본 두 묶음의 내용 검토와 바이트가 같은 범위의 개별 검증 PASS는 유효한 증거로 재사용했습니다.
공동 검증 입력 해시는 `/tmp/bam-js-spring-verified-hashes.json`에 고정했으며 이 상태 문단의 후속 갱신은 문서만 바꿉니다.
전체 제품 테스트·빌드·원격 CI, Spring 예제 서버·DB·보안 서비스 실행과 Java runner는 이번에 실행하지 않았습니다.
commit·push·PR·merge·공개 배포도 수행하지 않았으며 로컬 전용 경계를 유지합니다.
`[확인 필요]` 최종 `project_integrator`의 공동 로컬 통합 판정은 이 문서 갱신과 최종 변경분 검토 뒤에 인수합니다.
