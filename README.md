# BAM.dev

BAM.dev는 프로그래밍 문법을 읽는 데서 멈추지 않고, 개념을 설명하고 직접 구현하며 한 명의 개발자로 성장하도록 돕는 학습 가이드입니다.

현재 구현 범위는 **0~7차와 확장 검증 게이트**입니다. JavaScript·HTML·CSS·Java 4개 언어를 정식 과정으로 제공합니다. 전체 콘텐츠는 교안 24개(JavaScript 7·HTML 5·CSS 6·Java 6), 객관식 50문항(14·12·12·12), Code Quest 19개(JavaScript 5·HTML 5·CSS 4·Java 5), JavaScript·Java 코딩테스트 각 6문제와 HTML·CSS Web Project 1개입니다.

Code Quest에서는 언어의 실제 작성 단위를 그대로 편집합니다. JavaScript는 함수를, HTML은 JavaScript 래퍼 없는 마크업을, CSS는 JavaScript 래퍼 없는 스타일시트를, Java는 `public class Solution`의 `public static` 메서드를 작성합니다. HTML은 inert DOM과 doctype을, CSS는 고정 HTML fixture에 적용한 CSSOM 규칙·미디어 조건·계산 스타일을 공개 검사합니다. Java는 로컬 개발 서버가 Java 21 호환 소스로 컴파일한 뒤 매 테스트를 분리 프로세스에서 실행합니다. Web Project에서는 HTML과 CSS 두 파일을 함께 편집하고 안전 미리보기, 공개 자동 검사 70점과 자가평가 30점으로 결과를 점검합니다. 화면에 전달되는 모든 테스트와 assertion은 공개됩니다.

## 바로 실행하기

Node.js 20 이상이 필요합니다. Java 코드 실행에는 실행 중인 Docker Desktop과 로컬에 미리 준비된 고정 Java 21 이미지 `maven@sha256:3a4ab3276a087bf276f79cae96b1af04f53731bec53fb2e651aca79e4b10211e`가 필요합니다. 실행기는 이미지를 자동으로 pull하지 않으며 Docker daemon 또는 이미지가 없으면 Java 실행만 명시적으로 거부합니다. host JDK, 외부 채점 API, 클라우드 계정이나 유료 리소스는 사용하지 않습니다.

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
content/                 언어 비종속 메타데이터, 교안·fixture, 객관식·Quest·코딩테스트·Web Project
src/core/                콘텐츠·내비게이션·평가 도메인 로직
src/grading/             Worker·Java API·inert DOM·CSSOM 기반 채점 어댑터
src/repositories/        사용자 진도 저장소 추상화와 localStorage 구현
src/ui/                  안전한 제한형 Markdown·평가 화면 렌더러
src/workers/             공개 JavaScript 테스트를 실행하는 일회성 Worker
styles/                  디자인 토큰과 반응형 앱 UI
scripts/                 로컬 서버·Java 격리 채점기, 콘텐츠 검증, 정적 빌드
tests/                   Node 내장 테스트 러너 기반 단위 테스트
docs/                    아키텍처·결정·참고자료 기록
```

자세한 설계는 [아키텍처 문서](docs/architecture.md), 콘텐츠 추가 방법은 [콘텐츠 스키마](docs/content-schema.md), 단계 현황은 [로드맵](docs/roadmap.md)을 참고합니다.

## 저장 정책

학습 완료, 최근 교안, 최근 객관식 시도 20개, 오답 재도전 대상, Quest 초안 20개와 최근 실행 50개·호환용 완료 ID·리비전별 완료 상태, 코딩테스트 초안 20개와 최근 제출 50개·리비전별 완료 상태는 현재 `bam.dev.progress.v1` 키로 `localStorage`에 저장됩니다. Web Project는 별도 `bam.dev.web-projects.v1` 키에 최근 초안 10개와 source를 제외한 제출 요약 20개를 저장합니다. 사용자 소스는 실행·제출 기록에 중복 저장하지 않고 초안 저장소에만 보관합니다. `#/my` 마이페이지는 이 두 저장소의 실제 스냅샷만 읽어 언어별 진도, 오답·재도전 대상과 최근 제출 10건을 보여 줍니다. 화면 코드는 두 저장소 구현 뒤에서만 브라우저 저장소를 사용합니다. 브라우저 저장소가 차단되면 현재 탭의 메모리 저장소로 계속 동작하고 비영속 상태를 화면에 알립니다. 계정 로그인과 기기 간 동기화는 아직 연결하지 않았습니다.

## 참고 자료

UI 참고 코드에서는 구조, 색상, 간격, 사용자 흐름만 분석했습니다. React, MUI, Tailwind 구성요소나 의존성은 복사하지 않았습니다. JavaScript 교안은 사용자가 제공한 읽기 전용 학습자료를 프로젝트 내부에 복제한 뒤, 오프라인 실행·접근성·설명 정확성을 위해 필요한 부분만 보완했습니다. HTML·CSS 정식 교안은 교안에 명시한 WHATWG·W3C·MDN 표준 및 가이드를, Java 정식 교안은 Java SE 25 언어 명세와 API 문서를 근거로 프로젝트에서 새로 작성했으며 예제는 Java 21 호환 범위로 제한했습니다. 원본과 변경 내용, 프로젝트가 직접 작성한 문제·기준 답안·대표 오답 fixture의 출처는 [참고자료 감사 기록](docs/reference-audit.md)에 남겼습니다.
