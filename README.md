# BAM.dev

BAM.dev는 프로그래밍 문법을 읽는 데서 멈추지 않고, 개념을 설명하고 직접 구현하며 한 명의 개발자로 성장하도록 돕는 학습 가이드입니다.

현재 구현 범위는 **0~5차와 확장 검증 게이트**입니다. JavaScript·HTML·CSS 3개 언어를 정식 과정으로, Java를 언어 독립성 검증용 샘플로 제공합니다. 전체 콘텐츠는 교안 19개(JavaScript 7·HTML 5·CSS 6·Java 1), 객관식 39문항(14·12·12·1), Code Quest 14개(JavaScript 5·HTML 5·CSS 4), JavaScript 코딩테스트 6문제입니다.

Code Quest에서는 언어의 실제 작성 단위를 그대로 편집합니다. JavaScript는 함수를, HTML은 JavaScript 래퍼 없는 마크업을, CSS는 JavaScript 래퍼 없는 스타일시트를 작성합니다. HTML은 소스를 실행하지 않고 inert DOM과 doctype을 공개 검사하며, CSS는 안전 검사를 통과한 고정 HTML fixture에 스타일을 적용해 CSSOM 규칙·미디어 조건·계산 스타일을 공개 검사합니다. 코딩테스트의 `테스트 실행`과 `제출 및 채점`을 포함해 브라우저에 전달되는 모든 테스트는 공개 테스트입니다.

## 바로 실행하기

Node.js 20 이상만 필요합니다. 외부 패키지나 외부 서버는 사용하지 않습니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:4173`을 엽니다. 다른 포트가 필요하면 `BAM_DEV_PORT=5000 npm run dev`처럼 지정할 수 있습니다.

## 검증하기

```bash
npm run check
```

이 명령은 콘텐츠 스키마와 파일 연결을 검증하고, 단위 테스트를 실행한 뒤 `dist/` 빌드 결과를 만듭니다.

## 프로젝트 구조

```text
content/                 언어 비종속 메타데이터, 교안·fixture, 객관식·Quest·코딩테스트
src/core/                콘텐츠·내비게이션·평가 도메인 로직
src/grading/             Worker 및 inert DOM·CSSOM 기반 Quest·코딩테스트 채점 어댑터
src/repositories/        사용자 진도 저장소 추상화와 localStorage 구현
src/ui/                  안전한 제한형 Markdown·평가 화면 렌더러
src/workers/             공개 JavaScript 테스트를 실행하는 일회성 Worker
styles/                  디자인 토큰과 반응형 앱 UI
scripts/                 로컬 서버, 콘텐츠 검증, 정적 빌드
tests/                   Node 내장 테스트 러너 기반 단위 테스트
docs/                    아키텍처·결정·참고자료 기록
```

자세한 설계는 [아키텍처 문서](docs/architecture.md), 콘텐츠 추가 방법은 [콘텐츠 스키마](docs/content-schema.md), 단계 현황은 [로드맵](docs/roadmap.md)을 참고합니다.

## 저장 정책

학습 완료, 최근 교안, 최근 객관식 시도 20개, 오답 재도전 대상, Quest 초안 20개와 최근 실행 50개·완료 ID, 코딩테스트 초안 20개와 최근 제출 50개·리비전별 완료 상태는 현재 `bam.dev.progress.v1` 키로 `localStorage`에 저장됩니다. 사용자 소스는 실행·제출 기록에 중복 저장하지 않고 초안 저장소에만 보관합니다. HTML·CSS 확장도 기존 안정 ID와 `ProgressRepository` 계약을 그대로 사용하므로 화면 코드는 브라우저 저장소를 직접 다루지 않습니다. 8차에서는 저장소 구현을 Supabase로 교체하거나 로컬 데이터를 마이그레이션할 수 있습니다. 브라우저 저장소가 차단되면 현재 탭의 메모리 저장소로 계속 동작하고 비영속 상태를 화면에 알립니다.

## 참고 자료

UI 참고 코드에서는 구조, 색상, 간격, 사용자 흐름만 분석했습니다. React, MUI, Tailwind 구성요소나 의존성은 복사하지 않았습니다. JavaScript 교안은 사용자가 제공한 읽기 전용 학습자료를 프로젝트 내부에 복제한 뒤, 오프라인 실행·접근성·설명 정확성을 위해 필요한 부분만 보완했습니다. HTML·CSS 정식 교안은 교안에 명시한 WHATWG·W3C·MDN 표준 및 가이드를, Java 샘플은 언어 명세를 근거로 프로젝트에서 새로 작성했습니다. 원본과 변경 내용, 프로젝트가 직접 작성한 문제·기준 답안·대표 오답 fixture의 출처는 [참고자료 감사 기록](docs/reference-audit.md)에 남겼습니다.
