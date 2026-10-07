// This fixed model describes the displayed example; it does not interpret Java.
export const PERMUTATION_JAVA_LINES = Object.freeze([
  'import java.util.*;',
  'class Main {',
  '    static int[] nums = {1, 2, 3};',
  '    static boolean[] used = new boolean[nums.length];',
  '    static List<Integer> path = new ArrayList<>();',
  '    static List<List<Integer>> results = new ArrayList<>();',
  '    public static void main(String[] args) {',
  '        permute(0);',
  '    }',
  '    static void permute(int depth) {',
  '        if (depth == nums.length) {',
  '            results.add(new ArrayList<>(path));',
  '            return;',
  '        }',
  '        for (int i = 0; i < nums.length; i++) {',
  '            if (used[i]) continue;',
  '            used[i] = true;',
  '            path.add(nums[i]);',
  '            permute(depth + 1);',
  '            path.remove(path.size() - 1);',
  '            used[i] = false;',
  '        }',
  '    }',
  '}',
]);

export function createPermutationTrace() {
  const nums = [1, 2, 3];
  const used = [false, false, false];
  const path = [];
  const answers = [];
  const frames = [];
  const trace = [];
  let nextFrameId = 0;
  function record(event, line, description, actor = frames.at(-1)) {
    trace.push(Object.freeze({
      index: trace.length, event, line, description,
      executingFrameId: actor?.id ?? null,
      executingDepth: actor?.depth ?? null,
      frames: Object.freeze(frames.map((frame) => Object.freeze({ ...frame }))),
      path: Object.freeze([...path]), used: Object.freeze([...used]),
      answers: Object.freeze(answers.map((answer) => Object.freeze([...answer]))),
    }));
  }
  function visit(frame) {
    record('enter', 10, `깊이 ${frame.depth} 호출을 시작합니다. 이 호출의 i는 아직 없습니다.`);
    record('check', 11, `depth = ${frame.depth}: ${frame.depth === nums.length ? '세 자리를 모두 채웠습니다.' : '아직 채울 자리가 남았습니다.'}`);
    if (frame.depth === nums.length) {
      answers.push([...path]);
      record('copy', 12, `[${path.join(', ')}]의 복사본을 results에 추가합니다.`);
      frames.pop();
      record('return', 13, `깊이 ${frame.depth}에서 복귀합니다. path와 used는 그대로입니다. return은 공유 배열을 자동 복구하지 않습니다.`, frame);
      return;
    }
    for (frame.i = 0; frame.i < nums.length; frame.i++) {
      record('loop', 15, `깊이 ${frame.depth}의 지역 변수 i = ${frame.i}입니다.`);
      if (used[frame.i]) {
        record('skip', 16, `used[${frame.i}]가 true이므로 이미 고른 ${nums[frame.i]}을 건너뜁니다.`);
        continue;
      }
      record('check', 16, `used[${frame.i}]가 false이므로 ${nums[frame.i]}을 고를 수 있습니다.`);
      used[frame.i] = true;
      record('mark', 17, `used[${frame.i}]를 true로 바꿉니다. path에는 아직 추가하지 않았습니다.`);
      path.push(nums[frame.i]);
      record('choose', 18, `${nums[frame.i]}을 path 끝에 추가합니다.`);
      const child = { id: ++nextFrameId, depth: frame.depth + 1, i: null };
      frames.push(child);
      record('call', 19, `깊이 ${child.depth}를 호출합니다. 부모 깊이 ${frame.depth}의 i = ${frame.i}는 대기하는 동안 유지됩니다.`, frame);
      visit(child);
      const removed = path.pop();
      record('remove', 20, `복귀한 뒤 path 끝의 ${removed}을 지웁니다. used[${frame.i}]는 아직 true입니다.`);
      used[frame.i] = false;
      record('unmark', 21, `used[${frame.i}]를 false로 바꿉니다. 이제 다음 후보를 살펴볼 수 있습니다.`);
    }
    record('loop', 15, 'i = 3이므로 반복 조건 i < nums.length가 거짓입니다. 반복을 마칩니다.');
    frames.pop();
    record('return', 23, `깊이 ${frame.depth} 함수의 끝에 도달해 복귀합니다. 함수가 끝나도 공유 상태를 자동 복구하지 않습니다.`, frame);
  }
  record('start', 8, '시작 전: nums = [1, 2, 3], path는 비어 있고 used는 모두 false입니다.');
  const root = { id: nextFrameId, depth: 0, i: null };
  frames.push(root);
  record('call', 8, 'main에서 permute(0)을 호출합니다.', null);
  visit(root);
  record('complete', 8, '모든 호출을 마쳤습니다. 여섯 결과의 복사본은 남고 path와 used는 명시적인 복구 코드로 초기 상태가 되었습니다.');
  return Object.freeze(trace);
}

export function movePermutationCursor(cursor, delta, length) {
  return Math.max(0, Math.min(length - 1, cursor + delta));
}
