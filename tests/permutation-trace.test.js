import assert from "node:assert/strict";
import test from "node:test";
import {
  PERMUTATION_JAVA_LINES,
  createPermutationTrace,
  movePermutationCursor,
} from "../src/core/permutation-trace.js";

const expectedAnswers = [
  [1, 2, 3], [1, 3, 2], [2, 1, 3],
  [2, 3, 1], [3, 1, 2], [3, 2, 1],
];

test("고정 Java 순열 예제는 여섯 정답을 DFS 순서로 복사하고 공유 배열을 모두 복구한다", () => {
  const trace = createPermutationTrace();
  const copies = trace.filter((step) => step.event === "copy");
  assert.equal(copies.length, 6);
  assert.deepEqual(copies.map((step) => step.path), expectedAnswers);
  copies.forEach((step, index) => {
    assert.deepEqual(step.answers, expectedAnswers.slice(0, index + 1));
    assert.deepEqual(step.used, [true, true, true]);
  });
  assert.equal(trace[0].event, "start");
  assert.equal(trace.at(-1).event, "complete");
  assert.deepEqual(trace.at(-1).answers, expectedAnswers);
  assert.deepEqual(trace.at(-1).path, []);
  assert.deepEqual(trace.at(-1).used, [false, false, false]);
});

test("return은 프레임만 제거하고 path와 used의 복구는 각 명시 단계에서 일어난다", () => {
  const trace = createPermutationTrace();
  let returnedBranches = 0;
  for (let index = 1; index < trace.length; index += 1) {
    const previous = trace[index - 1];
    const step = trace[index];
    if (step.event !== "return") continue;
    assert.deepEqual(step.path, previous.path, `return ${index}: path 자동 복구 금지`);
    assert.deepEqual(step.used, previous.used, `return ${index}: used 자동 복구 금지`);
    assert.deepEqual(step.answers, previous.answers);
    assert.deepEqual(step.frames, previous.frames.slice(0, -1));
    if (step.frames.length === 0) continue;
    returnedBranches += 1;
    const remove = trace[index + 1];
    const unmark = trace[index + 2];
    assert.equal(remove.event, "remove");
    assert.deepEqual(remove.path, step.path.slice(0, -1));
    assert.deepEqual(remove.used, step.used, "path.remove는 used를 바꾸지 않는다");
    assert.equal(unmark.event, "unmark");
    const parentI = step.frames.at(-1).i;
    assert.deepEqual(unmark.used, step.used.map((value, i) => i === parentI ? false : value));
    assert.deepEqual(unmark.path, remove.path);
  }
  // 첫 선택 3개 + 두 번째 선택 6개 + 마지막 선택 6개.
  assert.equal(returnedBranches, 15);
});

test("재귀 호출 동안 각 부모 프레임의 i는 유지되고 자식은 별도의 i를 가진다", () => {
  const trace = createPermutationTrace();
  const pendingCalls = new Map();
  for (let index = 1; index < trace.length; index += 1) {
    const previous = trace[index - 1];
    const step = trace[index];
    if (step.event === "call") {
      assert.deepEqual(step.path, previous.path);
      assert.deepEqual(step.used, previous.used);
      assert.deepEqual(step.frames.slice(0, -1), previous.frames);
      const child = step.frames.at(-1);
      assert.equal(child.depth, step.frames.length === 1 ? 0 : step.frames.at(-2).depth + 1);
      assert.equal(child.i, null);
      if (step.frames.length === 1) {
        assert.equal(step.executingFrameId, null, "최초 호출은 main에서 수행한다");
        assert.equal(step.executingDepth, null);
      } else {
        assert.equal(step.executingFrameId, step.frames.at(-2).id);
        assert.equal(step.executingDepth, step.frames.at(-2).depth);
      }
      pendingCalls.set(child.id, structuredClone(step.frames.slice(0, -1)));
    }
    if (step.event === "return") {
      const returnedId = previous.frames.at(-1).id;
      assert.equal(step.executingFrameId, returnedId);
      assert.equal(step.executingDepth, previous.frames.at(-1).depth);
      if (pendingCalls.has(returnedId)) {
        assert.deepEqual(step.frames, pendingCalls.get(returnedId));
        pendingCalls.delete(returnedId);
      }
    }
    for (const [childId, parents] of pendingCalls) {
      if (step.frames.some((frame) => frame.id === childId)) {
        assert.deepEqual(step.frames.slice(0, parents.length), parents);
      }
    }
  }
  assert.equal(pendingCalls.size, 0);
  assert.equal(trace.at(-2).event, "return", "root도 함수 끝에서 명시된 단계로 복귀한다");
  assert.equal(trace.at(-2).executingDepth, 0);
  assert.deepEqual(trace.at(-2).frames, []);
});

test("각 단계는 독립 snapshot이며 정답은 공유 path가 아닌 복사본이다", () => {
  const trace = createPermutationTrace();
  for (let index = 1; index < trace.length; index += 1) {
    const previous = trace[index - 1];
    const step = trace[index];
    for (const key of ["path", "used", "frames", "answers"]) {
      assert.notEqual(step[key], previous[key], `${index}.${key}`);
    }
    step.frames.forEach((frame) => {
      assert.notEqual(frame, previous.frames.find((candidate) => candidate.id === frame.id));
    });
    step.answers.forEach((answer, answerIndex) => {
      assert.notEqual(answer, step.path);
      if (previous.answers[answerIndex]) assert.notEqual(answer, previous.answers[answerIndex]);
    });
  }
  const firstCopy = trace.find((step) => step.event === "copy");
  assert.throws(() => { firstCopy.path[0] = 99; }, TypeError);
  assert.throws(() => { firstCopy.answers[0][1] = 88; }, TypeError);
  assert.throws(() => { firstCopy.used[0] = false; }, TypeError);
  assert.deepEqual(firstCopy.path, [1, 2, 3]);
  assert.deepEqual(firstCopy.answers, [[1, 2, 3]]);
  assert.deepEqual(trace.at(-1).answers, expectedAnswers);
  assert.deepEqual(createPermutationTrace().at(-1).answers, expectedAnswers);
});

test("코드 강조는 실제 Java 예제 행을 가리키며 고정 입력과 정답 복사를 드러낸다", () => {
  const trace = createPermutationTrace();
  assert.match(PERMUTATION_JAVA_LINES.join("\n"), /new ArrayList<>\(path\)/);
  assert.match(PERMUTATION_JAVA_LINES.join("\n"), /\{\s*1,\s*2,\s*3\s*\}/);
  const operationLines = {
    mark: /used\[i\]\s*=\s*true/,
    choose: /path\.add\(nums\[i\]\)/,
    call: /permute\((?:depth\s*\+\s*1|0)\)/,
    copy: /new ArrayList<>\(path\)/,
    remove: /path\.remove\(path\.size\(\)\s*-\s*1\)/,
    unmark: /used\[i\]\s*=\s*false/,
  };
  for (const step of trace) {
    assert.equal(step.index, trace.indexOf(step));
    assert.ok(Number.isInteger(step.line));
    assert.ok(step.line >= 1 && step.line <= PERMUTATION_JAVA_LINES.length);
    assert.ok(step.description.length > 0);
    if (operationLines[step.event]) {
      assert.match(PERMUTATION_JAVA_LINES[step.line - 1], operationLines[step.event]);
    }
  }
});

test("이전·다음은 학습 cursor만 이동하며 처음·마지막 경계에서 멈춘다", () => {
  const trace = createPermutationTrace();
  const unchangedTrace = structuredClone(trace);
  assert.equal(movePermutationCursor(0, -1, trace.length), 0);
  assert.equal(movePermutationCursor(trace.length - 1, 1, trace.length), trace.length - 1);
  let cursor = 0;
  for (let index = 1; index < trace.length; index += 1) {
    cursor = movePermutationCursor(cursor, 1, trace.length);
    assert.equal(cursor, index);
  }
  for (let index = trace.length - 2; index >= 0; index -= 1) {
    cursor = movePermutationCursor(cursor, -1, trace.length);
    assert.equal(cursor, index);
  }
  assert.deepEqual(trace, unchangedTrace);
  const copyIndex = trace.findIndex((step) => step.event === "copy");
  const returnIndex = movePermutationCursor(copyIndex, 1, trace.length);
  assert.equal(trace[returnIndex].event, "return");
  assert.equal(movePermutationCursor(returnIndex, -1, trace.length), copyIndex);
  assert.deepEqual(trace[copyIndex].answers, [[1, 2, 3]]);
});
