import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stages = ["prerequisite_pending", "approval_pending", "implementation", "verification", "complete"];
const results = ["PASS", "FAIL", "BLOCKED"];

function requireObject(value, name, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name}: 객체가 필요합니다.`);
  }
  const unknown = Object.keys(value).filter((key) => !keys.includes(key));
  if (unknown.length) throw new Error(`${name}: 알 수 없는 필드 ${unknown.join(", ")}`);
}

function requireText(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name}: 비어 있지 않은 문자열이 필요합니다.`);
  }
}

function requireEvidence(value, name, revision) {
  requireObject(value, name, ["scopeRevision", "ref"]);
  requireText(value.ref, `${name}.ref`);
  if (value.scopeRevision !== revision) {
    throw new Error(`${name}: scopeRevision이 현재 범위와 다릅니다.`);
  }
}

function parseBlocks(markdown, sourcePath) {
  const blocks = [...markdown.matchAll(/^```workflow-state[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)];
  const openings = [...markdown.matchAll(/^```workflow-state[ \t]*\r?$/gm)];
  if (!blocks.length) throw new Error(`${sourcePath}: workflow-state 블록이 없습니다.`);
  if (blocks.length !== openings.length) throw new Error(`${sourcePath}: 닫히지 않은 workflow-state 블록이 있습니다.`);
  return blocks.map((block, index) => {
    try {
      return JSON.parse(block[1]);
    } catch (error) {
      throw new Error(`${sourcePath}: ${index + 1}번째 workflow-state JSON 오류: ${error.message}`);
    }
  });
}

function validateState(state) {
  requireObject(state, "workflow-state", [
    "version", "id", "scopeRevision", "scopeFiles", "stage", "prerequisites", "requiredChecks",
    "approval", "implementation", "verification", "completion",
  ]);
  if (state.version !== 1) throw new Error("workflow-state.version은 1이어야 합니다.");
  if (state.id !== undefined) requireText(state.id, "id");
  requireText(state.scopeRevision, "scopeRevision");
  if (!stages.includes(state.stage)) throw new Error("알 수 없는 stage입니다.");

  const prerequisites = state.prerequisites ?? [];
  if (!Array.isArray(prerequisites)) throw new Error("prerequisites는 배열이어야 합니다.");
  const prerequisiteIds = new Set();
  for (const prerequisite of prerequisites) {
    requireObject(prerequisite, "선행조건", ["id", "status", "ref"]);
    requireText(prerequisite.id, "선행조건 ID");
    requireText(prerequisite.ref, `선행조건 ${prerequisite.id}.ref`);
    if (prerequisiteIds.has(prerequisite.id)) throw new Error(`중복 선행조건 ID: ${prerequisite.id}`);
    prerequisiteIds.add(prerequisite.id);
    if (!["PASS", "PENDING", "BLOCKED"].includes(prerequisite.status)) {
      throw new Error(`알 수 없는 선행조건 상태: ${prerequisite.id}`);
    }
  }
  const unresolved = prerequisites.filter((item) => item.status !== "PASS");
  if (state.stage === "prerequisite_pending" && !unresolved.length) {
    throw new Error("prerequisite_pending에는 미충족 선행조건이 필요합니다.");
  }
  if (state.stage !== "prerequisite_pending" && unresolved.length) {
    throw new Error(`선행조건 미충족: ${unresolved.map((item) => item.id).join(", ")}`);
  }

  if (!Array.isArray(state.scopeFiles) || !state.scopeFiles.length) {
    throw new Error("scopeFiles는 하나 이상의 파일이어야 합니다.");
  }
  const paths = new Set();
  for (const file of state.scopeFiles) {
    requireObject(file, "scopeFiles 항목", ["path", "sha256"]);
    requireText(file.path, "scopeFiles.path");
    if (paths.has(file.path)) throw new Error(`중복 scopeFiles.path: ${file.path}`);
    paths.add(file.path);
    if (typeof file.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(file.sha256)) {
      throw new Error(`scopeFiles.sha256 형식 오류: ${file.path}`);
    }
  }

  if (!Array.isArray(state.requiredChecks) || !state.requiredChecks.length) {
    throw new Error("requiredChecks는 하나 이상의 검사 ID가 필요합니다.");
  }
  const required = new Set();
  for (const id of state.requiredChecks) {
    requireText(id, "requiredChecks ID");
    if (required.has(id)) throw new Error(`중복 requiredChecks ID: ${id}`);
    required.add(id);
  }

  for (const name of ["approval", "implementation", "completion"]) {
    if (state[name] !== null) requireEvidence(state[name], name, state.scopeRevision);
  }

  const stageIndex = stages.indexOf(state.stage);
  if (stageIndex <= 1 && [state.approval, state.implementation, state.verification, state.completion].some((item) => item !== null)) {
    throw new Error("선행조건·승인 대기에는 후속 단계 근거를 기록할 수 없습니다.");
  }
  if (stageIndex >= 2 && state.approval === null) throw new Error("구현 전이에는 승인 근거가 필요합니다.");
  if (stageIndex >= 3 && state.implementation === null) throw new Error("검증 전이에는 구현 근거가 필요합니다.");
  if (stageIndex < 3 && state.verification !== null) throw new Error("검증 단계 전에는 검증 결과를 기록할 수 없습니다.");
  if (stageIndex < 4 && state.completion !== null) throw new Error("완료 단계 전에는 완료 근거를 기록할 수 없습니다.");
  if (stageIndex >= 3 && state.verification === null) throw new Error("검증 단계에는 검증 상태가 필요합니다.");

  if (state.verification !== null) {
    const verification = state.verification;
    requireObject(verification, "verification", ["status", "checks", "stop"]);
    if (!["PENDING", ...results].includes(verification.status)) throw new Error("알 수 없는 검증 상태입니다.");
    if (!Array.isArray(verification.checks)) throw new Error("verification.checks는 배열이어야 합니다.");
    const seen = new Set();
    for (const check of verification.checks) {
      requireObject(check, "검사 결과", ["id", "result", "scopeRevision", "ref"]);
      if (!required.has(check.id)) throw new Error(`선언되지 않은 검사 ID: ${check.id}`);
      if (seen.has(check.id)) throw new Error(`중복 검사 결과: ${check.id}`);
      seen.add(check.id);
      if (!results.includes(check.result)) throw new Error(`알 수 없는 검사 결과: ${check.id}`);
      requireText(check.ref, `검사 ${check.id}.ref`);
      if (check.scopeRevision !== state.scopeRevision) {
        throw new Error(`검사 ${check.id}: scopeRevision이 현재 범위와 다릅니다.`);
      }
    }
    if (verification.status === "PASS") {
      const missing = state.requiredChecks.filter((id) => !verification.checks.some((check) => check.id === id && check.result === "PASS"));
      if (missing.length) throw new Error(`필수 검사 PASS 근거 누락: ${missing.join(", ")}`);
    } else if (verification.status === "PENDING") {
      if (verification.checks.some((check) => check.result !== "PASS")) throw new Error("PENDING에는 실패 결과를 둘 수 없습니다.");
    } else if (!verification.checks.some((check) => check.result === verification.status)) {
      throw new Error(`${verification.status} 상태에 대응하는 검사 근거가 없습니다.`);
    }

    if (["FAIL", "BLOCKED"].includes(verification.status)) {
      const stop = verification.stop;
      requireObject(stop, "verification.stop", ["returnTo", "reason", "nextAction", "attempt", "maxAttempts"]);
      if (!stages.slice(0, 4).includes(stop.returnTo)) throw new Error("잘못된 반환 stage입니다.");
      requireText(stop.reason, "stop.reason");
      requireText(stop.nextAction, "stop.nextAction");
      if (!Number.isInteger(stop.attempt) || !Number.isInteger(stop.maxAttempts) || stop.attempt < 1 || stop.attempt > stop.maxAttempts) {
        throw new Error("stop 시도 횟수는 1 ≤ attempt ≤ maxAttempts여야 합니다.");
      }
    } else if (verification.stop !== null) {
      throw new Error("PASS/PENDING에는 stop을 기록할 수 없습니다.");
    }
  }

  if (stageIndex === 4 && (state.verification.status !== "PASS" || state.completion === null)) {
    throw new Error("완료에는 전체 필수 검증 PASS와 별도 완료 근거가 필요합니다.");
  }
}

async function validateParsedState(state, root) {
  validateState(state);
  const rootPath = resolve(root);
  for (const file of state.scopeFiles) {
    const relativePath = relative(rootPath, resolve(rootPath, file.path));
    if (isAbsolute(file.path) || relativePath === ".." || relativePath.startsWith("../")) {
      throw new Error(`범위 밖 scopeFiles.path: ${file.path}`);
    }
    const actual = createHash("sha256").update(await readFile(resolve(rootPath, file.path))).digest("hex");
    if (actual !== file.sha256) throw new Error(`범위 파일 SHA-256 불일치: ${file.path}`);
  }
  return state;
}

export async function validateWorkflowCard(markdown, { root = projectRoot, sourcePath = "<text>" } = {}) {
  const states = parseBlocks(markdown, sourcePath);
  if (states.length !== 1) throw new Error(`${sourcePath}: workflow-state 블록은 정확히 하나여야 합니다.`);
  return validateParsedState(states[0], root);
}

export async function validateWorkflowCards(markdown, { root = projectRoot, sourcePath = "<text>" } = {}) {
  const states = parseBlocks(markdown, sourcePath);
  const ids = new Set();
  for (const state of states) {
    requireText(state.id, "id");
    if (ids.has(state.id)) throw new Error(`${sourcePath}: 중복 작업 ID: ${state.id}`);
    ids.add(state.id);
  }
  return Promise.all(states.map((state) => validateParsedState(state, root)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const paths = process.argv.slice(2);
    if (!paths.length) throw new Error("사용법: node scripts/validate-workflow.mjs <card.md>...");
    for (const path of paths) {
      await validateWorkflowCards(await readFile(path, "utf8"), { sourcePath: path });
      console.log(`PASS ${path}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
