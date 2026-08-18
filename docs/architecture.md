# 아키텍처

## 현재 경계

```text
curriculum.json + Markdown ──► 학습 화면 ───────────────┐
            │                                           │
            ├── quiz JSON ──► 검증·채점 ──► 객관식 화면 ├──► ProgressRepository ──► localStorage
            │                                           │
            ├── quest JSON ─► 계약 검증 ──► Quest 화면 ──┤
            │                                             │
            └── coding-test JSON ─► 목록·풀이·제출 화면 ─┘
                                        │
                                        └──► 테스트별 one-shot Worker ──► 공개 테스트 결과
```

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 객관식·Quest·코딩테스트를 안정적인 `lesson.id`·`conceptId`로 연결하고 실행 문제는 ID와 `revision`으로 식별하여, 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다.

## 브라우저 앱

- 해시 라우팅: 학습은 `#/learn/<language>/<lesson>`, 복습은 `#/review/<language>`, Quest는 `#/quest/<language>/<quest>`, 코딩테스트 목록·문제는 `#/coding-tests`와 `#/coding-tests/<language>/<problem>`을 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown과 언어별 객관식·Quest·코딩테스트 JSON을 각 계약으로 검증합니다. 교안의 실행 예제 데이터는 `content/fixtures/<languageId>/`에 두고 same-origin으로 불러오며 `content/` 전체와 함께 정적 빌드에 포함합니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 객관식: 콘텐츠 검증, 한 문제 채점, 전체 요약을 순수 도메인 함수로 분리합니다. 선택 전에는 정답 정보를 화면에 렌더링하지 않고 채점 후 네 선택지의 근거를 모두 표시합니다.
- Quest: 문제 계약, 시작 코드, 예시, 공개 테스트와 실패 설명을 콘텐츠로 관리합니다. 테스트마다 새 module Worker를 만들고 문법·런타임·시간·출력 제한·취소를 서로 다른 결과로 표시합니다. 브라우저에 포함된 테스트는 모두 공개 테스트입니다.
- 코딩테스트: 목록 검색과 난이도·언어·유형·풀이 상태 필터를 순수 도메인 함수로 분리합니다. 빠른 실행은 공개 테스트 일부, 제출은 전부를 사용하며 `CodingTestRunnerAdapter`가 기존 Worker DTO에 투영한 뒤 문제 ID와 실행 모드로 결과를 복원합니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다. 학습 완료, 객관식 시도·오답 ID, Quest 상태와 코딩테스트 초안·제출·리비전별 완료를 같은 버전 데이터 안의 독립 배열로 관리합니다. 실행·제출 기록에는 사용자 소스를 저장하지 않습니다.
- 저장 장애: 브라우저 저장소 접근이 막히면 메모리 저장소로 전환하며 저장소 계약이 영속 여부를 화면에 제공합니다.
- 언어 전환: 사이드바의 공통 언어 내비게이션은 `available`과 `sample` 언어를 첫 교안으로 연결하고, `planned` 언어는 비활성 상태로 표시합니다.
- 반응형: 데스크톱은 208px 사이드바와 Quest 및 코딩테스트 분할 화면을 사용합니다. 모바일은 상단 메뉴, 오버레이 내비게이션과 문제→편집기→결과 1열 흐름을 사용합니다.

## 향후 확장

- HTML, CSS, Java 샘플 교안과 객관식은 JavaScript와 같은 언어·교안·평가 스키마로 검증됩니다. 정식 콘텐츠 확장은 이후 단계에서 진행합니다.
- Supabase 도입 시 원격 저장소 구현과 로컬→원격 마이그레이션 계층만 추가합니다.
- Java 코드는 브라우저에서 실행하지 않고 격리된 채점 서비스로 전달합니다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 퀴즈의 질문·코드·선택지·해설도 모두 이스케이프하고 콘텐츠 ID를 DOM ID나 CSS 선택자로 직접 사용하지 않습니다.
- Quest의 사용자 코드는 주 실행 문맥에서 실행하지 않고 테스트마다 새 Worker에서 실행합니다. 이 경계는 DOM 응답성을 지키기 위한 것으로, 악의적 코드를 격리하는 보안 샌드박스는 아닙니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, 중복 없는 `aria-live`, 실행 결과 초점 이동, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.
