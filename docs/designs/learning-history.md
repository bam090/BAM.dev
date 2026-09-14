# `#/my` 내 학습 기록 복원

## 목적과 범위

`[확정 결정]` `#/my`는 학습자가 자신의 기록을 확인하고 다음 학습으로 돌아가는 화면이다. 독립 학습문서·객관식 UI는 보존하고, 해당 화면으로 가는 유틸리티 링크를 복원한다.

`[확정 결정]` 이 경계는 계정, 동기화, 서버, 새 Java 실행기를 만들지 않는다. 기록은 현재 기기의 저장 상태만 다루며 원시 사용자 코드를 공개하지 않는다.

## 표시와 재진입

`[확정 결정]` 화면은 실제 저장 상태를 `로컬 저장` 또는 `메모리만`으로 정확히 표시한다. 읽기 화면을 열거나 탐색해도 사용자 기록을 변경하지 않는다.

`[확정 결정]` 다음 정보를 제공한다.

- 활성 교안의 과정과 주제별 진행 상태. 보관 문서는 활성 진도 분모와 이어 학습 추천에서 제외하며 기존 직접 주소로는 계속 연다.
- 객관식 오답, 실패한 Code Quest·코딩테스트·Web Project의 재도전 진입점.
- 최근 기록 10건.

`[확정 결정]` 현재 제공하지 않는 콘텐츠의 기존 기록은 `이전 버전 · 현재 미제공`으로 보관해 표시한다. 이 항목에는 실행·재도전 링크를 만들지 않는다.

`[확정 결정]` 복원 경로는 legacy algorithm 별칭 7개와 직접 JavaScript hash·보관 URL을 우선 처리해 기존 진입 주소를 보존한다.

## 저장 호환성과 안전

`[확정 결정]` 기존 `bam.dev.progress.v1`과 Code Quest 완료 revision 계약을 보존한다. 완료는 현재 revision과 일치할 때만 표시하며, revision이 없는 legacy ID는 기존 revision 1 계약을 적용한다. 다른 데이터 키의 형식과 의미는 바꾸지 않는다.

`[확정 결정]` BrowserStorage의 정상 primary-key 열거가 기준이며, 다른 탭에서 키를 삭제한 뒤 남은 stale cache는 기록에 포함하지 않는다.

`[확정 결정]` Java Docker·HTTP·시스템 JDK 실행기는 현재 확정 실행 정책과 맞지 않으므로 재활성화하지 않는다. Git 원본 SHA 보관, Java 학습 문서·객관식, 현재 원문 보관 연결은 유지한다.

`[확정 결정]` 이 문서는 콘텐츠 삭제 정책의 승인이나 기존 콘텐츠의 폐기 결정을 만들지 않는다.

`[확정 결정]` `db1a5f4` 원본과 바이트·메타데이터를 보존하는 다음 보관 Java 문서는 `id`·파일 경로·원문 SHA-256·`archivedFromCatalog=true`가 모두 validator의 명시 목록과 일치할 때만 legacy `면접 답변 예시` 섹션 형식 요구를 면제한다: `java-02-control-flow-arrays`, `java-03-classes-objects`, `java-04-collections-generics`, `java-05-exceptions-debugging`, `java-06-review-practice`. H1 길이·학습 목표·schema·ID·order·경로 검사는 계속 적용하며, 활성 문서 전체와 목록에 없는 보관 문서, 원문이 변조된 보관 문서는 이 면제를 받을 수 없다. 원문 바이트·메타데이터와 활성 교안 분모 160은 유지한다.

## 오류·접근성·검증 인계

`[확정 결정]` 빈 기록, 저장 읽기 오류, 현재 미제공 항목을 각각 설명하고, 재도전과 이동은 native 링크·버튼의 키보드 흐름을 사용한다.

`[현재 사실]` 바뀐 호환·기록 계약의 선택 8개 test 파일은 한 번 실행해 91/91 PASS(fail·cancel 0)했고, progress 무쓰기·memory/read-error·Spring 재도전도 PASS했다. localhost `42873` 격리 desktop에서 `#/my` 키보드 진입→활성 0/160·과정 링크→보관 문서 1개 상세 키보드 진입→`java/types-and-methods` 정확 재진입과 console warn/error 0을 확인했다. 기존 660 PASS는 재사용 근거로만 쓰며 전체 build와 모바일 검증은 이 범위에 포함하지 않는다.

`[현재 사실]` 독립 content/doc 검증은 문서 단어 반환을 해소해 최종 PASS했고, 독립 `test_engineer`가 위 검증 결과를 확인했다. 독립 `project_integrator` 검토와 최종 통합 판정, commit·push·PR·CI 결과는 각각 인계 보고와 PR에서 실제로 확인한다.

`[현재 사실]` `6eef6d2` 게시 뒤 [PR #17](https://github.com/bam090/BAM.dev/pull/17)의 `CI / verify` 두 실행은 위 다섯 원본에 없는 답변 섹션을 요구해 실패했다. 원문 교육 내용 변경은 승인 범위가 아니며, validator 계약 수정은 진행 중이다. 새 독립 테스트와 `test_engineer` 검증, 최종 후속 검증과 Git 결과는 인계 보고와 PR에서 실제로 확인한다.
