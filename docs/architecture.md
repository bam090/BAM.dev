# 아키텍처

## 현재 경계

```text
curriculum.json + Markdown
          │
          ▼
   ContentService ──────► 화면 렌더링
                              │
                              ▼
                    ProgressRepository
                              │
                              ▼
                         localStorage
```

콘텐츠는 정적 읽기 전용 데이터이고, 진도는 사용자별 변경 데이터입니다. 두 데이터를 안정적인 `lesson.id`로 연결하여 콘텐츠 수정이 사용자 상태 형식을 불필요하게 바꾸지 않도록 합니다.

## 브라우저 앱

- 해시 라우팅: 정적 서버에서도 새로고침 경로 문제 없이 `#/learn/<language>/<lesson>`을 사용합니다.
- 콘텐츠 로딩: `curriculum.json` 검증 후 선택한 Markdown만 가져옵니다.
- Markdown: 프로젝트가 신뢰하는 제한된 문법만 HTML로 변환하며 원시 HTML은 항상 이스케이프합니다.
- 진도: `ProgressRepository` 계약과 `LocalStorageProgressRepository` 구현을 분리합니다.
- 반응형: 데스크톱은 208px 사이드바, 모바일은 상단 메뉴와 오버레이 내비게이션을 사용합니다.

## 향후 확장

- 객관식, Quest, 코딩테스트는 각각 별도 콘텐츠 컬렉션을 사용하고 `lessonId`와 `conceptId`로 교안에 연결합니다.
- HTML, CSS, Java는 같은 언어·교안 메타데이터 스키마를 사용합니다.
- Supabase 도입 시 원격 저장소 구현과 로컬→원격 마이그레이션 계층만 추가합니다.
- Java 코드는 브라우저에서 실행하지 않고 격리된 채점 서비스로 전달합니다.

## 보안과 접근성

- Markdown 원시 HTML을 실행하지 않습니다.
- 외부 링크는 `https:`만 허용하고 새 창 링크에 `noopener noreferrer`를 적용합니다.
- skip link, landmark, `aria-current`, `aria-live`, 키보드 메뉴 닫기와 명확한 focus ring을 제공합니다.
