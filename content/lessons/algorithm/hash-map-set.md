# 03. 해시와 Map·Set

## 학습 목표

- 해시가 키를 저장 위치와 연결하는 생각임을 설명할 수 있습니다.
- Map의 키·값 저장과 Set의 중복 없는 값 저장을 구분할 수 있습니다.
- 빈도 계산과 방문 여부 확인에 알맞은 컬렉션을 선택할 수 있습니다.
- 객체 키의 동일성과 존재하지 않는 키의 결과를 확인할 수 있습니다.

## 왜 필요한가

배열에서 위치를 모르는 값을 찾으려면 앞에서부터 차례로 비교할 수 있습니다. 이런 탐색을 같은 기준으로 여러 번 반복하면 확인해야 할 값도 계속 늘어납니다.
이럴 때 값 자체나 ID를 **키**로 삼아 개수나 존재 여부를 미리 연결해 둘 수 있습니다.
JavaScript의 `Map`과 `Set`을 사용하면 키와 값의 관계 또는 값의 존재 여부를 코드에 분명하게 표현할 수 있습니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `algo.dictionary`
- 이 단원: `algo.hashing`, `js.map-collection`, `js.set-collection`
- 후속: `algo.sorting`, `algo.two-pointers`, `algo.sliding-window`

## 해시 사고란?

**키**는 데이터를 찾을 때 기준으로 사용하는 값입니다.
**해시 함수**는 키를 계산해 **해시값(hash value)**을 만드는 규칙입니다.
**해싱(hashing)**은 이 해시값을 이용해 저장하거나 찾을 위치 후보를 정하는 과정입니다.
해시 테이블에서는 여러 저장 칸을 **버킷(bucket)**이라고 부르기도 합니다.

해시값 자체가 언제나 최종 배열 위치인 것은 아닙니다. 구현은 해시값과 현재 저장 공간의 크기 등을 이용해 위치 후보를 정할 수 있습니다. 서로 다른 키가 같은 해시값이나 같은 위치 후보에 대응되는 일을 **충돌(collision)**이라고 하며, 해시 테이블은 충돌한 키도 구분해 저장하는 규칙을 함께 사용합니다.

문제를 풀 때는 해시 함수를 직접 만드는 것보다 `값 → 개수`, `ID → 사용자`, `방문한 좌표`처럼 어떤 키로 무엇을 찾을지 먼저 정하는 일이 중요합니다.
이처럼 키로 필요한 정보를 연결해 반복 탐색을 줄이는 관점을 이 교안에서는 **해시 사고**라고 부릅니다.

JavaScript 명세는 `Map`과 `Set`의 내부 구조를 하나로 고정하지 않습니다.
구현은 해시 테이블일 수도 있고 다른 구조일 수도 있지만, 평균 접근 시간은 항목 수에 대해 선형보다 빨라야 합니다.
따라서 내부 구조를 반드시 해시 테이블이라고 하거나 모든 연산이 언제나 `O(1)`이라고 단정하면 안 됩니다.

### Java의 해시 설명과 구분하기

Java의 `HashMap`과 `HashSet`은 `hashCode()`로 해시값을 얻고 `equals()`로 같은 키나 요소인지 확인하는 구현 규칙을 문서로 제공합니다. 이 흐름은 해시와 충돌을 이해하는 데 도움이 되지만 JavaScript `Map`과 `Set`의 내부 동작으로 그대로 옮길 수는 없습니다.

JavaScript에서는 개발자가 `Map`의 버킷이나 해시값을 직접 다루지 않습니다. 어떤 키와 값을 저장할지, `Map`과 `Set` 중 무엇이 목적에 맞는지를 먼저 판단합니다.

## `Map`: 키와 값을 연결하기

**`Map`**은 `키 → 값` 형태의 쌍을 저장하는 표준 내장 컬렉션입니다.
`set()`은 키와 값을 저장하고 `get()`은 키에 연결된 값을 읽습니다.
`has()`는 키의 존재 여부를 `true` 또는 `false`로 반환합니다.

```javascript
function countWords(words) {
  const counts = new Map();

  for (const word of words) {
    const previousCount = counts.has(word) ? counts.get(word) : 0;
    counts.set(word, previousCount + 1);
  }

  return counts;
}

const counts = countWords(["달", "별", "달", "해", "달"]);
console.log(counts.get("달")); // 3
console.log(counts.get("별")); // 1
console.log(counts.size); // 3
```

처음 만난 단어는 이전 개수를 `0`으로 정합니다.
이미 저장된 단어는 `get()`으로 이전 개수를 읽고 `1`을 더해 같은 키에 다시 저장합니다.
같은 키에 `set()`을 다시 호출하면 새로운 항목이 늘어나는 대신 연결된 값이 바뀝니다.

`get()`은 키가 없을 때 `undefined`를 반환합니다.
저장된 값 자체가 `undefined`일 수도 있으므로 키의 존재를 구분해야 할 때는 `has()`를 사용합니다.

객체도 `Map`의 키로 사용할 수 있습니다.
모양과 속성값이 같은 두 객체를 따로 만들면 서로 다른 키로 판단됩니다.

```javascript
const storedUser = { id: 1 };
const sameShapeUser = { id: 1 };
const roles = new Map();

roles.set(storedUser, "관리자");

console.log(roles.get(storedUser)); // "관리자"
console.log(roles.get(sameShapeUser)); // undefined
console.log(roles.has(sameShapeUser)); // false
```

`storedUser`를 다시 사용하면 같은 객체를 가리키므로 저장한 값을 찾습니다.
`sameShapeUser`는 내용이 같아 보여도 별도로 만든 객체이므로 다른 키입니다.

## `Set`: 값의 존재만 기억하기

**`Set`**은 서로 다른 값만 한 번씩 저장하는 표준 내장 컬렉션입니다.
`add()`는 값을 넣고 `has()`는 그 값이 이미 있는지 확인합니다.
같은 값을 다시 넣어도 `size`는 늘어나지 않습니다.

```javascript
const submittedIds = new Set();

submittedIds.add("user-1");
submittedIds.add("user-2");
submittedIds.add("user-1");

console.log(submittedIds.has("user-1")); // true
console.log(submittedIds.size); // 2
console.log([...submittedIds]); // ["user-1", "user-2"]
```

값마다 횟수나 이름 같은 추가 정보가 필요하면 `Map`을 사용합니다.
이미 등장했는지만 확인하면 `Set`이 의도를 더 잘 드러냅니다.

| 필요한 정보 | 알맞은 도구 | 예 |
| --- | --- | --- |
| 키마다 연결된 값 | `Map` | 단어별 등장 횟수 |
| 값의 존재 여부 | `Set` | 이미 방문한 좌표 문자열 |
| 정해진 이름의 속성 묶음 | 객체 | 사용자 한 명의 이름과 등급 |

좌표를 `Set`에 저장할 때는 `"1,2"`처럼 같은 좌표가 같은 문자열이 되도록 바꿀 수 있습니다.
`[1, 2]` 배열을 매번 새로 만들면 모양이 같아도 서로 다른 객체이므로 같은 `Set` 값으로 판단되지 않습니다.

## 실행 흐름

다음 함수는 태그별 등장 횟수와 두 번 이상 나온 태그를 함께 구합니다.

```javascript
function summarizeTags(tags) {
  const counts = new Map();
  const duplicates = new Set();

  for (const tag of tags) {
    const nextCount = (counts.has(tag) ? counts.get(tag) : 0) + 1;
    counts.set(tag, nextCount);

    if (nextCount === 2) duplicates.add(tag);
  }

  return { counts, duplicates };
}

const summary = summarizeTags(["js", "css", "js", "html", "css", "js"]);
console.log([...summary.counts]); // [["js", 3], ["css", 2], ["html", 1]]
console.log([...summary.duplicates]); // ["js", "css"]
```

1. 빈 `Map`에는 태그별 개수를 저장합니다.
2. 빈 `Set`에는 중복이 확인된 태그만 저장합니다.
3. 첫 번째 `js`의 개수는 `1`이므로 중복 집합에 넣지 않습니다.
4. 두 번째 `js`의 개수가 `2`가 되는 순간 `duplicates`에 넣습니다.
5. 세 번째 `js`에서는 같은 값을 다시 넣지 않아도 이미 중복임을 알 수 있습니다.
6. 반복이 끝나면 개수 정보와 중복 정보가 서로 다른 목적의 컬렉션에 남습니다.

## 최소 코드

다음 함수는 배열에 같은 값이 두 번 이상 있는지 확인합니다.

```javascript
function hasDuplicate(values) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) return true;
    seen.add(value);
  }

  return false;
}

console.log(hasDuplicate(["a", "b", "a"])); // true
console.log(hasDuplicate(["a", "b", "c"])); // false
```

앞에서 본 값을 `seen`에 넣고 다시 만난 순간 바로 `true`를 반환합니다.
끝까지 중복을 찾지 못하면 `false`를 반환합니다.

## 흔한 실수

### 1. `Map`을 객체처럼 대괄호로 읽기

`map[key]`는 `Map` 항목을 읽는 문법이 아닙니다.
`Map`의 키와 값은 `set()`, `get()`, `has()`로 다룹니다.

### 2. 없는 키의 값을 바로 더하기

없는 키에 `get()`을 호출하면 `undefined`가 나옵니다.
개수를 셀 때는 키가 없으면 `0`부터 시작하도록 처리합니다.

### 3. `Set`에 개수가 저장된다고 생각하기

`Set`은 같은 값을 한 번만 보관하므로 등장 횟수를 알 수 없습니다.
횟수가 필요하면 `Map`의 값에 숫자를 저장합니다.

### 4. `Map`의 모든 연산 시간이 입력 크기와 무관하다고 단정하기

ECMAScript 명세는 평균 접근 시간이 선형보다 빠르도록 요구하지만 내부 자료 구조와 정확한 시간 복잡도는 고정하지 않습니다.
문제의 제한을 확인하고 `Map`이 키 기반 조회 의도를 잘 표현하는지 판단합니다.

## 확인 포인트

1. 키로 사용할 값과 그 키에 연결할 정보를 정했나요?
2. 추가 정보가 필요하면 `Map`, 존재 여부만 필요하면 `Set`을 선택했나요?
3. 없는 키에서 `get()`이 `undefined`를 반환하는 경우를 처리했나요?
4. JavaScript 명세가 보장하지 않는 내부 구현과 복잡도를 단정하지 않았나요?

## 확인 문제

1. 해시 함수와 충돌이 무엇인지 쉬운 말로 설명해 보세요.
2. 단어별 등장 횟수에는 `Map`, 방문한 좌표에는 `Set`이 알맞은 이유를 설명해 보세요.
3. `Map`으로 배열의 값별 등장 횟수를 세는 실행 순서를 설명해 보세요.
4. `get(key) === undefined`만으로 키가 없다고 확정하기 어려운 경우는 언제인가요?

## 공식 자료

- [ECMAScript 명세: Keyed Collections](https://tc39.es/ecma262/multipage/keyed-collections.html)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

## 추가 참고 자료

- [사용자 Hash.md](https://github.com/bam090/Obsidian/blob/main/profile/%EA%B2%BD%ED%97%98/%ED%95%99%EC%8A%B5/%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/Hash/Hash.md)
- [Oracle Java SE 25: Object.hashCode()](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html#hashCode())
- [Oracle Java SE 25: HashMap](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html)
- [MIT OpenCourseWare: Hashing with Chaining](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-8-hashing-with-chaining/)

자료 확인일: 2026-08-23

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

해시 함수는 키를 계산해 해시값을 만들고, 해싱은 그 값을 이용해 저장 위치 후보를 찾는 과정입니다.
서로 다른 키가 같은 해시값이나 버킷 후보에 대응되면 충돌이라고 하며 해시 테이블은 충돌한 키를 구분하는 규칙을 함께 둡니다.

### 답변 2

단어별 등장 횟수는 키마다 숫자를 연결해야 하므로 `Map`이 알맞습니다.
방문한 좌표는 이미 방문했는지만 알면 되므로 서로 다른 값을 한 번씩 저장하는 `Set`이 알맞습니다.

### 답변 3

빈 `Map`을 만들고 배열을 앞에서부터 순회합니다.
현재 값이 처음이면 `1`을 저장하고 이미 있으면 이전 개수에 `1`을 더해 같은 키에 다시 저장합니다.

### 답변 4

`Map`에는 값으로 `undefined`를 직접 저장할 수도 있습니다.
따라서 키의 존재 자체를 구분해야 할 때는 `get()`의 결과만 비교하지 않고 `has()`를 사용합니다.
