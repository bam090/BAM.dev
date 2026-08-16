# BAM.dev

BAM.dev는 프로그래밍 문법을 읽는 데서 멈추지 않고, 개념을 설명하고 직접 구현하며 한 명의 개발자로 성장하도록 돕는 학습 가이드입니다.

현재 구현 범위는 **0차 기반 구축 + 1차 JavaScript 학습 페이지**입니다. JavaScript 교안 7개 탐색, 이전·다음 이동, 완료 처리, 브라우저 재실행 후 진도 복원을 지원합니다.

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
content/                 언어 비종속 콘텐츠 메타데이터와 Markdown 교안
src/core/                콘텐츠·내비게이션 도메인 로직
src/repositories/        사용자 진도 저장소 추상화와 localStorage 구현
src/ui/                  안전한 제한형 Markdown 렌더러
styles/                  디자인 토큰과 반응형 앱 UI
scripts/                 로컬 서버, 콘텐츠 검증, 정적 빌드
tests/                   Node 내장 테스트 러너 기반 단위 테스트
docs/                    아키텍처·결정·참고자료 기록
```

자세한 설계는 [아키텍처 문서](docs/architecture.md), 콘텐츠 추가 방법은 [콘텐츠 스키마](docs/content-schema.md), 단계 현황은 [로드맵](docs/roadmap.md)을 참고합니다.

## 저장 정책

학습 진도는 현재 `bam.dev.progress.v1` 키로 `localStorage`에 저장됩니다. 화면 코드는 브라우저 저장소를 직접 다루지 않고 `ProgressRepository` 계약을 사용하므로, 8차에서 Supabase 저장소로 교체하거나 로컬 데이터를 마이그레이션할 수 있습니다.

## 참고 자료

UI 참고 코드에서는 구조, 색상, 간격, 사용자 흐름만 분석했습니다. React, MUI, Tailwind 구성요소나 의존성은 복사하지 않았습니다. JavaScript 교안은 사용자가 제공한 기존 학습자료의 읽기 전용 원본을 프로젝트 내부에 복제해 사용하며 출처는 [참고자료 감사 기록](docs/reference-audit.md)에 남겼습니다.
