import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateWorkflowCard, validateWorkflowCards } from "../scripts/validate-workflow.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const revision = "scope-1";
const evidence = (ref) => ({ scopeRevision: revision, ref });
const approved = evidence("approval-record");
const implemented = evidence("implementation-diff");
const completed = evidence("integration-receipt");
const hash = createHash("sha256")
  .update(await readFile(new URL("../package.json", import.meta.url)))
  .digest("hex");
const requiredChecks = ["java-runtime", "focused-tests"];
const checks = requiredChecks.map((id) => ({
  id,
  result: "PASS",
  ...evidence(`${id}-receipt`),
}));

function card(state) {
  return `# 작업 카드\n\n\`\`\`workflow-state\n${JSON.stringify({
    version: 1,
    scopeRevision: revision,
    scopeFiles: [{ path: "package.json", sha256: hash }],
    requiredChecks,
    stage: "approval_pending",
    approval: null,
    implementation: null,
    verification: null,
    completion: null,
    ...state,
  })}\n\`\`\`\n`;
}

const validate = (state) => validateWorkflowCard(card(state), { root, sourcePath: "tests/workflow-state.test.js" });
const verification = (overrides = {}) => ({ status: "PASS", checks, stop: null, ...overrides });

test("명시한 새 카드의 승인 대기와 모든 근거를 갖춘 완료를 허용한다", async () => {
  assert.equal((await validate({})).stage, "approval_pending");
  assert.equal((await validate({
    stage: "complete", approval: approved, implementation: implemented,
    verification: verification(), completion: completed,
  })).stage, "complete");
});

test("승인 증거가 없는 카드의 구현 전이를 거부한다", async () => {
  await assert.rejects(validate({ stage: "implementation", implementation: implemented }));
});

test("범위 개정 뒤에는 이전 개정의 근거와 변경된 파일 hash를 거부한다", async () => {
  const stale = { scopeRevision: "scope-0", ref: "old-record" };
  await assert.rejects(validate({ stage: "implementation", approval: stale }));
  await assert.rejects(validate({
    stage: "complete", approval: approved, implementation: implemented,
    verification: verification({ checks: [{ ...checks[0], scopeRevision: "scope-0" }, checks[1]] }),
    completion: completed,
  }));
  await assert.rejects(validateWorkflowCard(card({
    scopeFiles: [{ path: "package.json", sha256: "0".repeat(64) }],
  }), { root }));
});

test("검증 PASS는 별도 완료 증거 없이 전체 완료가 되지 않는다", async () => {
  assert.equal((await validate({
    stage: "verification", approval: approved, implementation: implemented,
    verification: verification(),
  })).stage, "verification");
  await assert.rejects(validate({
    stage: "complete", approval: approved, implementation: implemented,
    verification: verification(),
  }));
});

test("필수 검사 ID별 PASS가 없으면 다른 검사 PASS로 완료할 수 없다", async () => {
  await assert.rejects(validate({
    stage: "complete", approval: approved, implementation: implemented,
    verification: verification({ checks: [checks[1]] }), completion: completed,
  }));
  await assert.rejects(validate({
    stage: "complete", approval: approved, implementation: implemented,
    verification: verification({ checks: [checks[0], { ...checks[1], result: "BLOCKED" }] }),
    completion: completed,
  }));
});

test("검증 실패·차단은 반환점과 재시도 한도를 기록하며 완료할 수 없다", async () => {
  const stop = { returnTo: "implementation", reason: "재현 실패", nextAction: "수정 후 재검증", attempt: 1, maxAttempts: 2 };
  for (const status of ["FAIL", "BLOCKED"]) {
    const failedChecks = [{ ...checks[0], result: status }];
    assert.equal((await validate({
      stage: "verification", approval: approved, implementation: implemented,
      verification: verification({ status, checks: failedChecks, stop }),
    })).stage, "verification");
    await assert.rejects(validate({
      stage: "verification", approval: approved, implementation: implemented,
      verification: verification({ status, checks: failedChecks, stop: null }),
    }));
    await assert.rejects(validate({
      stage: "verification", approval: approved, implementation: implemented,
      verification: verification({ status, checks: failedChecks, stop: { ...stop, attempt: 3 } }),
    }));
    await assert.rejects(validate({
      stage: "complete", approval: approved, implementation: implemented,
      verification: verification({ status, checks: failedChecks, stop }), completion: completed,
    }));
  }
});

test("구현 증거가 없으면 검증 단계로 넘어갈 수 없다", async () => {
  await assert.rejects(validate({
    stage: "verification", approval: approved, verification: verification(),
  }));
});

test("한 문서의 모든 카드와 단일 카드 API 경계를 구분한다", async () => {
  const java = card({ id: "java-quest", stage: "approval_pending" });
  const followUp = card({
    id: "java-follow-up",
    stage: "prerequisite_pending",
    prerequisites: [{ id: "design-approval", status: "PENDING", ref: "decision-record" }],
  });
  const states = await validateWorkflowCards(`${java}\n${followUp}`, { root });
  assert.deepEqual(states.map(({ id, stage }) => [id, stage]).sort(), [
    ["java-quest", "approval_pending"],
    ["java-follow-up", "prerequisite_pending"],
  ].sort());
  assert.equal((await validateWorkflowCard(java, { root })).id, "java-quest");
  await assert.rejects(validateWorkflowCard(`${java}\n${followUp}`, { root }));
});

test("다중 카드의 누락·중복 ID와 한 카드의 오류를 숨기지 않는다", async () => {
  const valid = card({ id: "first" });
  await assert.rejects(validateWorkflowCards("# 카드 없음", { root }));
  await assert.rejects(validateWorkflowCards(`${valid}\n\`\`\`workflow-state\n{broken\n\`\`\``, { root }));
  await assert.rejects(validateWorkflowCards(`${valid}\n${card({})}`, { root }));
  await assert.rejects(validateWorkflowCards(`${valid}\n${card({ id: "first" })}`, { root }));
  await assert.rejects(validateWorkflowCards(`${valid}\n${card({ id: "second", stage: "implementation" })}`, { root }));
});

test("미충족 선행조건은 승인 대기와 구현 진입을 막는다", async () => {
  const prerequisites = [{ id: "runtime-contract", status: "BLOCKED", ref: "decision-pending" }];
  const pending = card({ id: "follow-up", stage: "prerequisite_pending", prerequisites });
  assert.equal((await validateWorkflowCards(pending, { root }))[0].stage, "prerequisite_pending");
  await assert.rejects(validateWorkflowCard(card({
    id: "follow-up", stage: "approval_pending", prerequisites,
  }), { root }));
  await assert.rejects(validateWorkflowCard(card({
    id: "follow-up", stage: "implementation", prerequisites, approval: approved,
  }), { root }));
  assert.equal((await validateWorkflowCard(card({
    id: "follow-up", stage: "approval_pending",
    prerequisites: [{ ...prerequisites[0], status: "PASS" }],
  }), { root })).stage, "approval_pending");
});

test("roadmap의 여섯 카드가 전부 유효하며 Java 승인 뒤 구현 단계다", async () => {
  const roadmap = await readFile(new URL("../docs/roadmap.md", import.meta.url), "utf8");
  const states = await validateWorkflowCards(roadmap, { root, sourcePath: "docs/roadmap.md" });
  assert.deepEqual(states.map(({ id, stage }) => [id, stage]).sort(), [
    ["source-java-browser", "implementation"],
    ["source-data-protection", "prerequisite_pending"],
    ["review-history", "prerequisite_pending"],
    ["web-assignment-pilot", "prerequisite_pending"],
    ["react-list-pilot", "prerequisite_pending"],
    ["release-content-audit", "prerequisite_pending"],
  ].sort());
});
