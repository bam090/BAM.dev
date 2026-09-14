# CSS 레이아웃 종합 진단

## 학습 목표

화면이 어긋난 증거를 순서대로 좁히고 콘텐츠 관계에 맞는 배치 도구를 선택할 수 있습니다.

## 한줄 요약

연결·규칙·박스·부모 배치·넘침·환경 순서로 원인을 찾고 필요한 관계마다 도구를 고릅니다.

## 먼저 확인할 개념

[캐스케이드](#/learn/css/wiki-cascade), [박스 모델](#/learn/css/wiki-box-model), [넘침](#/learn/css/wiki-overflow), [Flexbox](#/learn/css/wiki-flexbox), [Grid](#/learn/css/wiki-grid), [relative와 absolute](#/learn/css/wiki-positioning)의 기본 판단을 함께 복습합니다.

## 증상에서 원인으로 범위를 좁힌다

카드가 넘친다고 width나 overflow를 바로 바꾸면 실제 원인을 숨길 수 있다.
아래 순서로 증거를 모으고 한 번에 가설 하나를 확인한다.

| 순서 | 확인할 증거 |
| --- | --- |
| 연결과 문법 | CSS 파일 요청·link 경로·유효한 속성과 값·중괄호 |
| 적용 규칙 | 선택자 일치·미디어 조건·이긴 선언·상속 출처 |
| 박스 | content·padding·border·margin·box-sizing·최소/최대 크기 |
| 부모 배치 | 일반 흐름·Flex 축·Grid 트랙·position의 기준 조상 |
| 넘침 | 고정 크기·긴 문자열·이미지·항목의 자동 최소 크기 |
| 현재 환경 | 너비 변화·긴 문구·확대·키보드·hover 없음·모션 감소 |

Network·Elements·Styles·Computed는 Chrome과 Edge 계열 개발자 도구의 대표 이름이다.
다른 브라우저에서는 같은 기능의 이름과 위치가 다를 수 있다.

## 규칙이 덮였는지 확인하기

선택자가 요소와 일치하지 않으면 `!important`를 더해도 그 선언은 후보가 되지 않는다.
Styles의 취소선이 다른 선언에 덮인 것을 나타낸다면 같은 속성의 이긴 선언을 찾아 출처·중요도·레이어·명시도·순서를 비교한다.
문법이 잘못되었거나 현재 배치에 적용되지 않는 선언도 별도로 표시될 수 있으므로 표시의 이유를 먼저 확인한다.
Computed에서 최종값과 출처를 보고 필요한 규칙 하나를 바꾼 뒤 결과를 비교한다.

## 넘침의 조건을 하나씩 바꾼다

일반 가로쓰기로 두 카드를 한 줄에 놓고, 부모 content 너비는 40rem이라고 가정하자.

```css
.card-list {
  writing-mode: horizontal-tb;
  display: flex;
  gap: 1rem;
}

.card {
  box-sizing: content-box;
  flex: 0 0 22rem;
  padding: 1rem;
  border: 2px solid;
}
```

카드의 content 너비 두 개만 더해도 44rem이며 gap·padding·border까지 필요하다.
shrink가 0이어서 줄어들지도 않는다. 이 조건에서 부모가 넘치는 이유를 설명할 수 있다.

카드가 다음 줄로 내려가도 된다면 `flex-wrap: wrap`을 먼저 검토한다.
이후 `border-box`, 줄어들 수 있는 flex 값, 긴 콘텐츠에 필요한 최소 크기·줄바꿈을 각각 확인한다.
전부 동시에 고치거나 내용을 숨기기보다 어떤 변경이 어떤 원인을 해결했는지 기록한다.

## 도구를 관계별로 나누기

행과 열을 함께 맞추는 바깥 카드 목록은 Grid, 카드 안의 한 줄 버튼 묶음은 Flexbox를 먼저 검토한다.
카드 모서리에만 배지를 겹치려면 카드를 relative로 위치 기준으로 만들고 배지만 absolute로 흐름에서 뺀다.
본문과 목록 전체까지 absolute로 줄 세우면 내용 길이가 달라질 때 관계를 유지하기 어렵다.
배지가 본문을 가리지 않게 공간을 확보하되 문구 길이가 불확실해 서로 밀어내야 한다면 배지도 일반 흐름에 둔다.

| 대상 | 담당 부모와 도구 | 확인할 범위 |
| --- | --- | --- |
| 카드 목록 | 목록 부모의 Grid | 열·행·gap·최소 트랙 |
| 카드의 버튼들 | 버튼 묶음 부모의 Flexbox | 주축·교차축·줄바꿈 |
| 카드 모서리 배지 | 카드 relative + 배지 absolute | 기준 박스·내용 겹침 |
| 제목과 여러 문단 | 일반 흐름 | HTML 읽기 순서 |

도구는 서로 대체하는 유행이 아니라 다른 관계의 책임이다.
목록의 Grid와 내부의 Flexbox를 함께 쓸 수 있고, margin을 큰 값으로 밀어 놓는 것만으로 이 관계를 대신하지 않는다.
CSS 화면 순서를 바꿨다면 HTML 읽기·Tab 이동 순서와 어긋나지 않는지도 확인한다.

## 이어서 연습하기

[상품 카드 레이아웃](#/quest/css/product-card-layout)에서 흐름과 배지의 기준을, [반응형 코스 Grid](#/quest/css/responsive-course-grid)에서 조건에 따른 열 배치를 연습할 수 있습니다.
각 실습은 가까운 개념의 작성 연습이며 이 문서 전체의 독립 평가를 대신하지 않습니다.

## 공식 자료

- [Chrome DevTools CSS 참조](https://developer.chrome.com/docs/devtools/css/reference)
- [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/)
- [CSS Grid Layout Module Level 2](https://www.w3.org/TR/css-grid-2/)

## 핵심 질문 답

연결과 문법부터 선택자·캐스케이드, 박스 크기, 배치하는 부모, 줄어들지 않는 원인, 현재 환경 순서로 증거를 좁힙니다.
취소선이 충돌을 뜻한다면 이긴 선언을 비교하고, 일치하지 않는 선택자에 important부터 붙이지 않습니다.
목록의 행·열은 Grid, 내부 한 축 정렬은 Flexbox, 카드 기준의 겹침은 relative와 absolute처럼 관계별로 도구를 고릅니다.
한 번에 한 가설을 확인한 뒤 긴 내용·너비 변화·확대·키보드와 사용자 설정에서도 정보가 남는지 다시 살펴봅니다.
