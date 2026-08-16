# 콘텐츠 스키마

`content/curriculum.json`은 언어와 교안 메타데이터를 정의하고 본문은 별도 Markdown 파일로 둡니다.

## 언어

| 필드 | 의미 |
| --- | --- |
| `id` | URL과 연결에 쓰는 안정적인 소문자 ID |
| `name` | 사용자에게 보이는 이름 |
| `shortName` | 작은 배지용 이름 |
| `status` | `available`, `sample`, `planned` 중 하나 |
| `accent` | CSS에서 허용한 테마 키 |

## 교안

| 필드 | 의미 |
| --- | --- |
| `id` | 진도와 평가가 참조하는 변경하지 않는 ID |
| `languageId` | 언어 ID |
| `order` | 언어 안에서 1부터 시작하는 연속 순서 |
| `slug` | 해시 URL에 쓰는 고유 문자열 |
| `title` | 화면 제목 |
| `summary` | 목록에 보이는 한 문장 설명 |
| `essentialQuestion` | 학습을 이끄는 핵심 질문 |
| `objectives` | 확인 가능한 학습 목표 배열 |
| `estimatedMinutes` | 예상 학습 시간 |
| `conceptIds` | 퀴즈·Quest가 연결할 개념 ID 배열 |
| `contentFile` | 저장소 루트 기준 Markdown 경로 |
| `source` | 원본 성격과 검증일을 기록하는 메타데이터 |

새 교안을 추가하면 `npm run validate:content`로 필수 필드, ID·slug 중복, 순서 연속성, 콘텐츠 파일 존재 여부를 확인합니다.
