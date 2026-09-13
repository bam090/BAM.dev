# 행과 열의 관계를 나타내는 표

## 학습 목표

표 데이터의 제목과 행·열 머리글 관계를 caption·th·scope로 표현할 수 있습니다.

## 한줄 요약

table은 행과 열이 서로 설명하는 데이터에 사용하고 caption과 머리글이 각 값의 의미를 알려 줍니다.

## 먼저 확인할 개념

[항목의 관계에 맞는 목록](#/learn/html/wiki-lists)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 목적부터 묻는 선택 순서

| 먼저 물을 질문 | 알맞은 관계 | 먼저 검토할 요소 |
| --- | --- | --- |
| 행과 열이 서로 설명하는가? | 표 데이터 | `table` |

## 표는 행과 열의 관계가 있을 때 사용한다

달력처럼 보이게 만들기 위해서가 아니라, 각 날짜와 책과 장소가 행과 열로 연결될 때 `table`을 사용한다.

```html
<table>
  <caption>2026년 가을 책모임 일정</caption>
  <thead>
    <tr>
      <th scope="col">날짜</th>
      <th scope="col">책</th>
      <th scope="col">장소</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">9월 20일</th>
      <td>느린 밤의 산책</td>
      <td>별빛도서관</td>
    </tr>
    <tr>
      <th scope="row">10월 18일</th>
      <td>작은 정원의 편지</td>
      <td>달빛문화실</td>
    </tr>
  </tbody>
</table>
```

- `caption`은 표 전체가 무엇인지 알려 준다.
- `thead`는 머리글 행 묶음, `tbody`는 본문 데이터 행 묶음이다.
- `th`는 다른 칸을 설명하는 머리글 칸이다.
- 단순한 표에서 `scope="col"`은 열, `scope="row"`는 행을 설명한다고 밝힌다.
- `td`는 데이터 칸이다.

`scope`는 단순한 표에서 행과 열의 관계를 알려 주는 데 도움이 된다.
머리글 관계가 복잡한 표는 `scope` 하나만으로 충분한지 따로 확인해야 한다.

화면의 두 상자를 나란히 놓기 위해 표를 쓰지 않는다.
화면 배치는 CSS의 역할이다.

## 이어서 연습하기

[학습 순서와 주간 기록 표](#/quest/html/list-data-table) — 순서 있는 학습 절차와 행·열 관계를 함께 작성합니다.

## 공식 자료

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [WAI Audio and Video Media](https://www.w3.org/WAI/media/av/)

## 핵심 질문 답

날짜·책·장소처럼 행과 열이 서로 연결된 데이터에 table을 씁니다.
caption은 표 전체를 설명하고 th는 머리글, td는 데이터이며 단순한 표에서 scope=col은 열, scope=row는 행을 설명합니다.
복잡한 머리글은 추가 관계 검토가 필요하고 화면 상자를 나란히 배치하는 일에는 표 대신 CSS를 사용합니다.
