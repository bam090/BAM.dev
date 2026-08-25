# 02. 구현과 문자열 시뮬레이션

## 학습 목표

- 구현과 시뮬레이션 문제가 무엇을 평가하는지 설명할 수 있습니다.
- 문제의 입력, 상태, 한 단계의 변화와 출력을 구분할 수 있습니다.
- 문자열 입력을 필요한 단위로 나누고 순서대로 처리할 수 있습니다.
- 경계값과 상태 갱신 순서를 예제로 검증할 수 있습니다.

## 왜 필요한가

코딩테스트의 구현 문제는 특별한 공식을 찾기보다 주어진 규칙을 빠뜨리지 않고 코드로 옮기는 문제입니다.
문장이 길어 보여도 입력을 정리하고 현재 상태를 갱신하는 순서를 정하면 작은 단계로 풀 수 있습니다.
문자열 시뮬레이션은 명령이나 기록처럼 글자로 주어진 입력을 읽고 그 뜻에 따라 상태를 바꾸는 가장 기본적인 구현 연습입니다.

## 개념 연결

- 선행: `algo.list`, `algo.condition`, `js.operators`
- 이 단원: `algo.simulation`, `algo.string-processing`
- 후속: `algo.hashing`, `js.map-collection`, `js.set-collection`

## 구현과 시뮬레이션이란?

**구현**은 문제의 조건과 절차를 실제 코드로 정확하게 옮기는 일입니다.
**시뮬레이션**은 정해진 규칙을 순서대로 적용하면서 값이 변하는 과정을 따라가는 풀이 방법입니다.
이때 계속 기억해야 하는 현재 값을 **상태**라고 합니다.

예를 들어 로봇의 현재 위치는 상태이고 `R 3`을 만나면 오른쪽으로 세 칸 이동한다는 내용은 규칙입니다.
명령 하나를 처리할 때마다 위치를 갱신하면 마지막 위치를 구할 수 있습니다.

문제를 읽을 때 먼저 다음 네 가지를 적습니다.

1. 입력으로 무엇이 주어지나요?
2. 실행 중 계속 기억할 상태는 무엇인가요?
3. 입력 하나마다 어떤 규칙을 적용하나요?
4. 마지막에 무엇을 반환하거나 출력하나요?

## 문자열을 풀이용 데이터로 바꾸기

**파싱**은 문자열을 프로그램이 다루기 쉬운 값으로 나누고 변환하는 과정입니다.
쉼표로 구분된 명령이라면 먼저 쉼표를 기준으로 나눈 뒤 각 조각의 바깥 공백을 제거할 수 있습니다.

```javascript
const commandText = " R 2, L 1, R 3 ";
const commands = commandText
  .split(",")
  .map((command) => command.trim())
  .filter((command) => command.length > 0);

console.log(commands); // ["R 2", "L 1", "R 3"]
```

`split(",")`은 쉼표를 기준으로 새 배열을 만듭니다.
`trim()`은 각 명령 앞뒤의 공백을 제거합니다.
`filter()`는 비어 있는 조각을 제외합니다.

명령 안의 방향과 거리는 앞뒤 공백을 제거한 뒤 `\s+` 정규식으로 나눕니다.
`\s+`는 연속된 공백과 탭을 하나의 구분자로 다룹니다.
문자열로 읽은 거리는 `Number()`로 바꾼 뒤 유한한 `0` 이상의 숫자인지 확인합니다.

```javascript
const command = "  R\t  4  ";
const tokens = command.trim().split(/\s+/);

if (tokens.length !== 2) {
  throw new Error("명령은 방향과 거리 두 값이어야 합니다.");
}

const [direction, distanceText] = tokens;
const distance = Number(distanceText);

if (direction !== "R" && direction !== "L") {
  throw new Error("방향은 R 또는 L이어야 합니다.");
}

if (!Number.isFinite(distance) || distance < 0) {
  throw new Error("거리는 0 이상의 유한한 숫자여야 합니다.");
}

console.log(direction); // "R"
console.log(distance); // 4
console.log(typeof distance); // "number"
```

토큰 수를 먼저 확인하면 `"R"`처럼 거리가 없거나 `"R 2 extra"`처럼 값이 많은 명령을 계산 전에 거부할 수 있습니다.
방향과 거리를 각각 확인하면 잘못된 입력이 `NaN` 계산이나 반대 방향 이동으로 조용히 이어지는 일을 막을 수 있습니다.

## 상태를 갱신하는 규칙 만들기

현재 위치처럼 계속 바뀌는 값은 `let` 변수에 저장합니다.
다음 상태를 먼저 계산하고 조건을 통과했을 때만 현재 상태에 반영하면 경계 규칙을 읽기 쉽습니다.

```javascript
function move(position, command) {
  const tokens = command.trim().split(/\s+/);

  if (tokens.length !== 2) {
    throw new Error("명령은 방향과 거리 두 값이어야 합니다.");
  }

  const [direction, distanceText] = tokens;
  const distance = Number(distanceText);

  if (direction !== "R" && direction !== "L") {
    throw new Error("방향은 R 또는 L이어야 합니다.");
  }

  if (!Number.isFinite(distance) || distance < 0) {
    throw new Error("거리는 0 이상의 유한한 숫자여야 합니다.");
  }

  if (direction === "R") return position + distance;
  return position - distance;
}

console.log(move(2, "R 3")); // 5
console.log(move(2, "L 1")); // 1
```

`move()`는 한 명령의 계산만 담당하므로 전체 반복문과 분리해서 확인할 수 있습니다.
형식, 방향이나 거리가 입력 계약과 다르면 상태를 바꾸지 않고 오류를 발생시킵니다.

## 실행 흐름

다음 함수는 `0`부터 `8` 사이에서만 움직이는 로봇의 마지막 위치를 구합니다.
범위를 벗어나는 명령은 무시하고 실제로 머문 위치를 `visited`에 기록합니다.
이 예제의 방향은 `R` 또는 `L`, 거리는 `0` 이상의 유한한 숫자로 바꿀 수 있는 문자열로 주어진다고 가정합니다.

```javascript
function simulateRobot(commandText, minPosition, maxPosition) {
  const commands = commandText
    .split(",")
    .map((command) => command.trim())
    .filter((command) => command.length > 0);
  let position = minPosition;
  const visited = [position];

  for (const command of commands) {
    const tokens = command.trim().split(/\s+/);

    if (tokens.length !== 2) {
      throw new Error("명령은 방향과 거리 두 값이어야 합니다.");
    }

    const [direction, distanceText] = tokens;
    const distance = Number(distanceText);

    if (direction !== "R" && direction !== "L") {
      throw new Error("방향은 R 또는 L이어야 합니다.");
    }

    if (!Number.isFinite(distance) || distance < 0) {
      throw new Error("거리는 0 이상의 유한한 숫자여야 합니다.");
    }

    const nextPosition = direction === "R"
      ? position + distance
      : position - distance;

    if (nextPosition < minPosition || nextPosition > maxPosition) continue;

    position = nextPosition;
    visited.push(position);
  }

  return { position, visited };
}

const result = simulateRobot("R 3, R 4, L 2, L 9", 0, 8);
console.log(result.position); // 5
console.log(result.visited); // [0, 3, 7, 5]
```

1. 문자열을 쉼표로 나누어 네 개의 명령을 만듭니다.
2. 시작 상태 `position`은 최솟값인 `0`입니다.
3. `R 3`을 적용한 다음 위치 `3`은 범위 안이므로 상태를 갱신합니다.
4. `R 4`와 `L 2`를 차례로 적용하면 위치는 `7`, `5`가 됩니다.
5. `L 9`의 다음 위치 `-4`는 범위를 벗어나므로 현재 상태를 바꾸지 않습니다.
6. 마지막 위치 `5`와 실제로 머문 위치 배열을 반환합니다.

## 최소 코드

다음 함수는 명령 문자열에서 앞으로 이동하는 `F`의 개수를 셉니다.

```javascript
function countForwardMoves(commands) {
  let count = 0;

  for (const command of commands) {
    if (command === "F") count += 1;
  }

  return count;
}

console.log(countForwardMoves("FFLFR")); // 3
```

문자열도 `for...of`로 앞에서부터 읽을 수 있습니다.
상태 `count`는 `F`를 만났을 때만 바뀝니다.

## 흔한 실수

### 1. 입력 형식을 확인하지 않고 바로 계산하기

`"4" + 1`은 숫자 덧셈이 아니라 문자열 연결이므로 `"41"`이 됩니다.
숫자 계산이 필요하면 파싱 단계에서 `Number()`로 변환합니다.

### 2. 다음 상태를 확인하기 전에 현재 상태를 바꾸기

범위를 벗어나는 이동을 무시해야 한다면 다음 위치를 별도 변수로 계산한 뒤 경계를 확인합니다.
현재 위치를 먼저 바꾸면 잘못된 상태를 다시 되돌리는 코드가 필요해집니다.

### 3. 명령 순서를 바꾸기

시뮬레이션은 앞 명령의 결과가 다음 명령의 입력이 됩니다.
문제에서 동시에 처리한다고 명시하지 않았다면 입력 순서대로 상태를 갱신합니다.

### 4. 경계값을 한 칸 잘못 확인하기

허용 범위가 `0` 이상 `8` 이하라면 `0`과 `8`도 유효한 위치입니다.
`<`, `>`, `<=`, `>=` 중 어떤 비교가 필요한지 조건 문장과 함께 확인합니다.

## 확인 포인트

1. 입력 문자열을 어떤 기준으로 나눌지 정했나요?
2. 문자열로 읽은 숫자를 실제 숫자로 변환했나요?
3. 반복 중 바뀌는 상태와 바뀌지 않는 규칙을 구분했나요?
4. 최소값, 최대값, 빈 입력처럼 경계에 가까운 예를 손으로 추적했나요?

## 확인 문제

1. 구현 문제를 입력, 상태, 규칙, 출력으로 나누는 이유를 설명해 보세요.
2. `"R 3, L 1"`을 두 개의 명령과 숫자 거리로 바꾸는 순서를 설명해 보세요.
3. 시뮬레이션에서 다음 상태를 먼저 계산한 뒤 현재 상태를 바꾸면 어떤 점이 좋은가요?
4. 설명과 코드가 같은 규칙을 따르는지 어떤 입력으로 확인할 수 있나요?

## 공식 자료

- [MDN: String.prototype.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN: Number()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number)
- [MIT OpenCourseWare: Simulation Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/79ba958de1d1c186610e6869e5b46788_MIT6_006F11_rec08.pdf)

공식 자료 확인일: 2026-08-20

## 면접 답변 예시

먼저 자신의 말로 답한 뒤, 면접관에게 설명하듯 아래 예시와 비교해 보세요.

### 답변 1

구현 문제는 긴 요구사항을 바로 코드로 쓰기보다 입력, 상태, 규칙, 출력으로 나누면 누락을 줄일 수 있습니다.
저는 반복마다 어떤 상태가 왜 바뀌는지 먼저 적은 뒤 그 순서대로 코드를 작성합니다.

### 답변 2

먼저 쉼표를 기준으로 `split()`하고 각 조각에 `trim()`을 적용합니다.
그다음 명령을 `trim().split(/\s+/)`로 나누어 방향과 거리 문자열을 얻고 거리는 `Number()`로 변환합니다.
토큰이 두 개인지, 방향이 `R` 또는 `L`인지, 거리가 `0` 이상의 유한한 숫자인지 확인한 뒤 계산합니다.

### 답변 3

다음 상태를 별도로 계산하면 경계나 금지 조건을 통과한 경우에만 현재 상태를 갱신할 수 있습니다.
그래서 잘못된 상태를 되돌리는 코드가 줄고 규칙의 적용 순서도 더 분명해집니다.

### 답변 4

최솟값과 최댓값에 정확히 도착하는 입력, 범위를 한 칸 벗어나는 입력, 명령이 없는 입력을 확인합니다.
각 단계의 예상 상태를 손으로 적고 실제 반환값과 비교하면 설명과 코드의 불일치를 찾을 수 있습니다.
