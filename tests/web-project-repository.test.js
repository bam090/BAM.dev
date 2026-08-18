import assert from "node:assert/strict";
import test from "node:test";
import { WEB_PROJECT_CONTRACT_VERSION } from "../src/core/web-project.js";
import {
  createBrowserStorage,
  MemoryStorage,
} from "../src/repositories/browser-storage.js";
import {
  LocalStorageWebProjectRepository,
  MAX_WEB_PROJECT_DRAFTS,
  MAX_WEB_PROJECT_SUBMISSIONS,
  WEB_PROJECT_RECORD_KEY_PREFIX,
  WEB_PROJECT_STORAGE_KEY,
  getWebProjectDraftToken,
  createEmptyWebProjectState,
  normalizeWebProjectState,
} from "../src/repositories/web-project-repository.js";

const PROJECT_ID = "web-project-learning-board";
const REVISION = 1;
const FIXED_INSTANT = "2026-08-18T10:00:00.000Z";
const fixedNow = () => new Date(FIXED_INSTANT);

class InterleavingStorage extends MemoryStorage {
  constructor() {
    super();
    this.beforeReadReturn = null;
    this.isInterleaving = false;
    this.readCount = 0;
    this.triggerRead = 1;
  }

  interleaveNextRead(callback) {
    this.interleaveOnRead(1, callback);
  }

  interleaveOnRead(readNumber, callback) {
    this.readCount = 0;
    this.triggerRead = readNumber;
    this.beforeReadReturn = callback;
  }

  getItem(key) {
    const staleValue = super.getItem(key);
    if (this.isInterleaving) return staleValue;
    this.readCount += 1;
    if (!this.beforeReadReturn || this.readCount !== this.triggerRead) {
      return staleValue;
    }

    const callback = this.beforeReadReturn;
    this.beforeReadReturn = null;
    this.isInterleaving = true;
    try {
      callback();
    } finally {
      this.isInterleaving = false;
    }
    return staleValue;
  }
}

function createFiles(suffix = "") {
  return [
    {
      path: "index.html",
      source: `<!doctype html><main>학습 계획${suffix}</main>`,
    },
    {
      path: "styles.css",
      source: `main { display: grid; } /* ${suffix} */`,
    },
  ];
}

function createManualAssessments(status = "self_assessed") {
  return [
    {
      criterionId: "manual-readable-layout",
      status,
      levelId: status === "pending" ? null : "good",
    },
  ];
}

function createSubmission(index = 1, overrides = {}) {
  return {
    submissionId: `web-project-submission-${index}`,
    contractVersion: WEB_PROJECT_CONTRACT_VERSION,
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    submittedAt: `2026-08-18T10:00:${String(index).padStart(2, "0")}.000Z`,
    files: createFiles(String(index)),
    manualAssessments: createManualAssessments(),
    ...overrides,
  };
}

function createReport(overrides = {}) {
  return {
    contractVersion: WEB_PROJECT_CONTRACT_VERSION,
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    isComplete: true,
    isVerified: false,
    provisionalScore: 100,
    maxPoints: 100,
    automatic: {
      status: "complete",
      earnedPoints: 70,
      maxPoints: 70,
      criteria: [
        {
          criterionId: "auto-semantic-main",
          outcome: "passed",
          earnedPoints: 70,
          maxPoints: 70,
          isComplete: true,
        },
      ],
    },
    manual: {
      status: "complete",
      earnedPoints: 30,
      maxPoints: 30,
      criteria: [
        {
          criterionId: "manual-readable-layout",
          status: "self_assessed",
          levelId: "good",
          earnedPoints: 30,
          maxPoints: 30,
          isComplete: true,
        },
      ],
    },
    ...overrides,
  };
}

test("Web Project 상태는 진도와 분리된 전용 키에서 시작한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, fixedNow);

  assert.deepEqual(repository.getState(), createEmptyWebProjectState());
  assert.equal(storage.getItem("bam.dev.progress.v1"), null);

  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles(),
  });

  assert.ok(storage.getItem(WEB_PROJECT_STORAGE_KEY));
  assert.equal(storage.getItem("bam.dev.progress.v1"), null);
  assert.deepEqual(repository.getPersistenceStatus(), { isPersistent: false });
});

test("ResilientBrowserStorage는 primary에 키 열거 API가 없어도 manifest로 레코드를 복원한다", () => {
  const values = new Map();
  const primaryStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  const firstStorage = createBrowserStorage({ localStorage: primaryStorage });
  const firstTab = new LocalStorageWebProjectRepository(firstStorage, fixedNow);
  firstTab.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("persisted without key api"),
  });

  const secondStorage = createBrowserStorage({ localStorage: primaryStorage });
  const secondTab = new LocalStorageWebProjectRepository(secondStorage, fixedNow);
  const restored = secondTab.getState().drafts.find(
    (draft) => draft.projectId === PROJECT_ID,
  );

  assert.match(restored.files[0].source, /persisted without key api/);
  assert.equal(secondStorage.isPersistent(), true);
});

test("초안은 프로젝트와 리비전 쌍으로 저장하고 stale 리비전을 복원하지 않는다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  const input = {
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("draft"),
  };

  const saved = repository.saveDraft(input);
  input.files[0].source = "나중에 바꾼 입력";

  assert.equal(saved.updatedAt, FIXED_INSTANT);
  assert.equal(saved.files[0].source.includes("draft"), true);
  assert.equal(Object.isFrozen(saved), true);
  assert.equal(Object.isFrozen(saved.files), true);
  assert.equal(repository.getDraft(PROJECT_ID, REVISION + 1), null);
  assert.throws(() => repository.getDraft(PROJECT_ID), /현재 리비전/);

  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION + 1,
    files: createFiles("revision 2"),
  });
  assert.equal(repository.getDraft(PROJECT_ID, REVISION).projectRevision, REVISION);
  assert.equal(
    repository.getDraft(PROJECT_ID, REVISION + 1).projectRevision,
    REVISION + 1,
  );
});

test("같은 프로젝트·리비전 초안은 교체하고 최근 10개만 보관한다", () => {
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 10, 0, 0, tick++));
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, now);

  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("first"),
  });
  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("latest"),
  });
  assert.equal(repository.getState().drafts.length, 1);
  assert.equal(
    repository.getDraft(PROJECT_ID, REVISION).files[0].source.includes("latest"),
    true,
  );

  for (let index = 2; index <= MAX_WEB_PROJECT_DRAFTS + 2; index += 1) {
    repository.saveDraft({
      projectId: `web-project-sample-${index}`,
      projectRevision: 1,
      files: createFiles(String(index)),
    });
  }

  const drafts = repository.getState().drafts;
  assert.equal(drafts.length, MAX_WEB_PROJECT_DRAFTS);
  assert.equal(drafts.some((draft) => draft.projectId === PROJECT_ID), false);
  assert.equal(
    drafts.some(
      (draft) =>
        draft.projectId === `web-project-sample-${MAX_WEB_PROJECT_DRAFTS + 2}`,
    ),
    true,
  );
  assert.equal(
    storage.keys().filter((key) =>
      key.startsWith(`${WEB_PROJECT_RECORD_KEY_PREFIX}.draft.`),
    ).length,
    MAX_WEB_PROJECT_DRAFTS,
  );
});

test("초안 시각이 모두 같아도 방금 저장한 레코드를 보관 한도 정리에서 보호한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, fixedNow);
  for (let index = 1; index <= MAX_WEB_PROJECT_DRAFTS; index += 1) {
    repository.saveDraft({
      projectId: `web-project-sample-${index}`,
      projectRevision: REVISION,
      files: createFiles(`sample ${index}`),
    });
  }

  repository.saveDraft({
    projectId: "web-project-aaa",
    projectRevision: REVISION,
    files: createFiles("new same instant"),
  });

  assert.match(
    repository.getDraft("web-project-aaa", REVISION).files[0].source,
    /new same instant/,
  );
  assert.equal(repository.getState().drafts.length, MAX_WEB_PROJECT_DRAFTS);
});

test("다른 탭이 바꾼 초안을 오래된 전체 스냅샷으로 덮어쓰지 않는다", () => {
  const storage = new MemoryStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 10, 0, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);
  const initial = firstTab.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("initial"),
  });
  const initialToken = getWebProjectDraftToken(initial);

  firstTab.saveDraft(
    {
      projectId: PROJECT_ID,
      projectRevision: REVISION,
      files: createFiles("first tab"),
    },
    { expectedDraftToken: initialToken },
  );

  assert.throws(
    () =>
      secondTab.saveDraft(
        {
          projectId: PROJECT_ID,
          projectRevision: REVISION,
          files: createFiles("stale second tab"),
        },
        { expectedDraftToken: initialToken },
      ),
    (error) => error?.code === "draft_conflict",
  );
  assert.equal(
    secondTab.getDraft(PROJECT_ID, REVISION).files[0].source.includes("first tab"),
    true,
  );
});

test("초안 저장 직전 최신 상태를 재병합해 다른 프로젝트의 동시 변경을 보존한다", () => {
  const storage = new InterleavingStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 10, 0, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);
  const secondProjectId = "web-project-secondary";
  const firstInitial = firstTab.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("first initial"),
  });
  const secondInitial = secondTab.saveDraft({
    projectId: secondProjectId,
    projectRevision: REVISION,
    files: createFiles("second initial"),
  });

  storage.interleaveNextRead(() => {
    secondTab.saveDraft(
      {
        projectId: secondProjectId,
        projectRevision: REVISION,
        files: createFiles("second latest"),
      },
      { expectedDraftToken: getWebProjectDraftToken(secondInitial) },
    );
  });
  firstTab.saveDraft(
    {
      projectId: PROJECT_ID,
      projectRevision: REVISION,
      files: createFiles("first latest"),
    },
    { expectedDraftToken: getWebProjectDraftToken(firstInitial) },
  );

  assert.match(firstTab.getDraft(PROJECT_ID, REVISION).files[0].source, /first latest/);
  assert.match(
    secondTab.getDraft(secondProjectId, REVISION).files[0].source,
    /second latest/,
  );
});

test("두 번째 읽기 뒤 다른 탭이 저장해도 서로 다른 프로젝트 초안 레코드는 유실되지 않는다", () => {
  const storage = new InterleavingStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 10, 30, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);
  const secondProjectId = "web-project-secondary";
  const firstInitial = firstTab.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("first initial"),
  });
  const secondInitial = secondTab.saveDraft({
    projectId: secondProjectId,
    projectRevision: REVISION,
    files: createFiles("second initial"),
  });

  storage.interleaveOnRead(2, () => {
    secondTab.saveDraft(
      {
        projectId: secondProjectId,
        projectRevision: REVISION,
        files: createFiles("second after read"),
      },
      { expectedDraftToken: getWebProjectDraftToken(secondInitial) },
    );
  });
  firstTab.saveDraft(
    {
      projectId: PROJECT_ID,
      projectRevision: REVISION,
      files: createFiles("first after read"),
    },
    { expectedDraftToken: getWebProjectDraftToken(firstInitial) },
  );

  assert.match(firstTab.getDraft(PROJECT_ID, REVISION).files[0].source, /first after read/);
  assert.match(
    firstTab.getDraft(secondProjectId, REVISION).files[0].source,
    /second after read/,
  );
});

test("초안 삭제도 정확한 리비전을 요구한다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles(),
  });

  assert.equal(repository.clearDraft(PROJECT_ID, REVISION + 1), false);
  assert.notEqual(repository.getDraft(PROJECT_ID, REVISION), null);
  assert.equal(repository.clearDraft(PROJECT_ID, REVISION), true);
  assert.equal(repository.getDraft(PROJECT_ID, REVISION), null);
});

test("초안 입력은 안전한 HTML·CSS 경로, 크기와 일반 데이터 객체만 허용한다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  const save = (overrides) =>
    repository.saveDraft({
      projectId: PROJECT_ID,
      projectRevision: REVISION,
      files: createFiles(),
      ...overrides,
    });

  assert.throws(() => save({ projectId: "project" }), /형식/);
  assert.throws(() => save({ projectRevision: 0 }), /형식/);
  assert.throws(
    () => save({ files: [{ path: "../index.html", source: "" }] }),
    /형식/,
  );
  assert.throws(
    () =>
      save({
        files: [{ path: "index.html", source: "가".repeat(7_000) }],
      }),
    /형식/,
  );
  assert.throws(
    () =>
      save({
        files: [{ path: "main.js", source: "alert(1)" }],
      }),
    /형식/,
  );
  assert.throws(
    () =>
      repository.saveDraft({
        projectId: PROJECT_ID,
        projectRevision: REVISION,
        files: createFiles(),
        unexpected: true,
      }),
    /형식/,
  );

  const accessorInput = { projectId: PROJECT_ID, projectRevision: REVISION };
  Object.defineProperty(accessorInput, "files", {
    enumerable: true,
    get() {
      throw new Error("호출되면 안 됨");
    },
  });
  assert.throws(() => repository.saveDraft(accessorInput), /형식/);
});

test("제출 기록은 원문 source를 버리고 제출·점수 요약만 저장한다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, fixedNow);
  const submission = createSubmission();
  const report = createReport();

  const stored = repository.recordSubmission(submission, report);
  submission.files[0].source = "입력 객체 변조";
  report.automatic.criteria[0].outcome = "failed";

  assert.equal(stored.recordedAt, FIXED_INSTANT);
  assert.equal(stored.report.provisionalScore, 100);
  assert.equal(stored.report.automatic.criteria[0].outcome, "passed");
  assert.equal(Object.hasOwn(stored, "files"), false);
  assert.equal(Object.isFrozen(stored.report.automatic.criteria), true);

  const manifest = JSON.parse(storage.getItem(WEB_PROJECT_STORAGE_KEY));
  const record = JSON.parse(
    storage.getItem(
      `${WEB_PROJECT_RECORD_KEY_PREFIX}.submission.${stored.projectId}@${stored.projectRevision}@${stored.submissionId}`,
    ),
  );
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(Object.hasOwn(record, "files"), false);
  assert.equal(JSON.stringify(record).includes("<!doctype html>"), false);
  assert.equal(JSON.stringify(record).includes("입력 객체 변조"), false);
});

test("수동 평가가 pending인 미완료 리포트도 null 점수 의미를 보존한다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  const submission = createSubmission(1, {
    manualAssessments: createManualAssessments("pending"),
  });
  const report = createReport({
    isComplete: false,
    provisionalScore: null,
    automatic: {
      status: "complete",
      earnedPoints: 0,
      maxPoints: 70,
      criteria: [
        {
          criterionId: "auto-semantic-main",
          outcome: "failed",
          earnedPoints: 0,
          maxPoints: 70,
          isComplete: true,
        },
      ],
    },
    manual: {
      status: "incomplete",
      earnedPoints: null,
      maxPoints: 30,
      criteria: [
        {
          criterionId: "manual-readable-layout",
          status: "pending",
          levelId: null,
          earnedPoints: null,
          maxPoints: 30,
          isComplete: false,
        },
      ],
    },
  });

  const stored = repository.recordSubmission(submission, report);

  assert.equal(stored.report.isComplete, false);
  assert.equal(stored.report.provisionalScore, null);
  assert.equal(stored.report.manual.earnedPoints, null);
  assert.equal(stored.manualAssessments[0].levelId, null);
});

test("제출 기록은 최근 20개만 보관하고 프로젝트별 조회를 지원한다", () => {
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 11, 0, 0, tick++));
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, now);

  for (let index = 1; index <= MAX_WEB_PROJECT_SUBMISSIONS + 2; index += 1) {
    repository.recordSubmission(createSubmission(index), createReport());
  }

  const submissions = repository.listSubmissions();
  assert.equal(submissions.length, MAX_WEB_PROJECT_SUBMISSIONS);
  assert.equal(
    submissions.some(
      (submission) => submission.submissionId === "web-project-submission-1",
    ),
    false,
  );
  assert.equal(
    submissions.at(-1).submissionId,
    `web-project-submission-${MAX_WEB_PROJECT_SUBMISSIONS + 2}`,
  );
  assert.equal(repository.listSubmissions(PROJECT_ID).length, submissions.length);
  assert.deepEqual(repository.listSubmissions("web-project-empty"), []);
  assert.throws(() => repository.listSubmissions("invalid"), /유효한/);
  assert.equal(
    storage.keys().filter((key) =>
      key.startsWith(`${WEB_PROJECT_RECORD_KEY_PREFIX}.submission.`),
    ).length,
    MAX_WEB_PROJECT_SUBMISSIONS,
  );
});

test("제출 시각이 모두 같아도 방금 저장한 append-only 레코드를 보관한다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  for (let index = 1; index <= MAX_WEB_PROJECT_SUBMISSIONS; index += 1) {
    repository.recordSubmission(
      createSubmission(index, {
        submissionId: `web-project-submission-sample-${index}`,
      }),
      createReport(),
    );
  }

  repository.recordSubmission(
    createSubmission(1, {
      submissionId: "web-project-submission-aaa",
    }),
    createReport(),
  );

  assert.ok(
    repository.listSubmissions().some(
      (submission) => submission.submissionId === "web-project-submission-aaa",
    ),
  );
  assert.equal(repository.listSubmissions().length, MAX_WEB_PROJECT_SUBMISSIONS);
});

test("제출 저장 직전 최신 상태를 재병합해 다른 탭의 동시 제출을 보존한다", () => {
  const storage = new InterleavingStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 11, 0, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);

  storage.interleaveNextRead(() => {
    secondTab.recordSubmission(createSubmission(2), createReport());
  });
  firstTab.recordSubmission(createSubmission(1), createReport());

  assert.deepEqual(
    firstTab.listSubmissions().map((submission) => submission.submissionId).sort(),
    ["web-project-submission-1", "web-project-submission-2"],
  );
});

test("두 번째 읽기 뒤 다른 탭이 제출해도 append-only 제출 레코드는 함께 남는다", () => {
  const storage = new InterleavingStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 11, 30, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);

  storage.interleaveOnRead(2, () => {
    secondTab.recordSubmission(createSubmission(2), createReport());
  });
  firstTab.recordSubmission(createSubmission(1), createReport());

  assert.deepEqual(
    firstTab.listSubmissions().map((submission) => submission.submissionId).sort(),
    ["web-project-submission-1", "web-project-submission-2"],
  );
});

test("서로 다른 프로젝트가 같은 제출 ID를 동시에 만들어도 복합 레코드 키로 둘 다 보존한다", () => {
  const storage = new InterleavingStorage();
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 11, 45, 0, tick++));
  const firstTab = new LocalStorageWebProjectRepository(storage, now);
  const secondTab = new LocalStorageWebProjectRepository(storage, now);
  const sharedSubmissionId = "web-project-submission-shared";
  const secondProjectId = "web-project-secondary";

  storage.interleaveOnRead(2, () => {
    secondTab.recordSubmission(
      createSubmission(1, {
        submissionId: sharedSubmissionId,
        projectId: secondProjectId,
      }),
      createReport({ projectId: secondProjectId }),
    );
  });
  firstTab.recordSubmission(
    createSubmission(1, { submissionId: sharedSubmissionId }),
    createReport(),
  );

  const submissions = firstTab.listSubmissions();
  assert.equal(submissions.length, 2);
  assert.deepEqual(
    submissions.map((submission) => submission.projectId).sort(),
    [PROJECT_ID, secondProjectId].sort(),
  );
  assert.ok(
    storage.keys().some((key) =>
      key.includes(`${secondProjectId}@${REVISION}@${sharedSubmissionId}`),
    ),
  );
});

test("중복 제출 ID와 제출·리포트 계약 불일치를 거부한다", () => {
  const repository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  repository.recordSubmission(createSubmission(), createReport());

  assert.throws(
    () => repository.recordSubmission(createSubmission(), createReport()),
    /중복 저장/,
  );
  assert.throws(
    () =>
      repository.recordSubmission(
        createSubmission(2),
        createReport({ projectRevision: 2 }),
      ),
    /형식/,
  );
  assert.throws(
    () =>
      repository.recordSubmission(
        createSubmission(3),
        createReport({ provisionalScore: 99 }),
      ),
    /형식/,
  );
  assert.throws(
    () =>
      repository.recordSubmission(
        createSubmission(4, {
          manualAssessments: createManualAssessments("pending"),
        }),
        createReport(),
      ),
    /형식/,
  );
});

test("기존 aggregate v1 상태를 독립 레코드로 지연 마이그레이션한다", () => {
  const summaryRepository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    fixedNow,
  );
  const submissionSummary = summaryRepository.recordSubmission(
    createSubmission(),
    createReport(),
  );
  const legacyDraft = {
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("legacy"),
    updatedAt: FIXED_INSTANT,
  };
  const storage = new MemoryStorage();
  storage.setItem(
    WEB_PROJECT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts: [legacyDraft],
      submissions: [submissionSummary],
      updatedAt: FIXED_INSTANT,
    }),
  );
  const repository = new LocalStorageWebProjectRepository(storage, fixedNow);

  const migrated = repository.getState();

  assert.equal(migrated.drafts.length, 1);
  assert.match(migrated.drafts[0].files[0].source, /legacy/);
  assert.equal(migrated.submissions.length, 1);
  assert.equal(migrated.submissions[0].submissionId, submissionSummary.submissionId);
  assert.equal(JSON.parse(storage.getItem(WEB_PROJECT_STORAGE_KEY)).schemaVersion, 2);
  assert.ok(
    storage.keys().some((key) =>
      key.startsWith(`${WEB_PROJECT_RECORD_KEY_PREFIX}.draft.`),
    ),
  );
  assert.ok(
    storage.keys().some((key) =>
      key.startsWith(`${WEB_PROJECT_RECORD_KEY_PREFIX}.submission.`),
    ),
  );
});

test("legacy aggregate가 다시 나타나도 authoritative 독립 초안을 되돌리지 않는다", () => {
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 7, 18, 12, 0, 0, tick++));
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, now);
  repository.saveDraft({
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles("record latest"),
  });
  storage.setItem(
    WEB_PROJECT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts: [
        {
          projectId: PROJECT_ID,
          projectRevision: REVISION,
          files: createFiles("legacy stale"),
          updatedAt: "2026-08-18T11:00:00.000Z",
        },
      ],
      submissions: [],
      updatedAt: "2026-08-18T11:00:00.000Z",
    }),
  );

  const restored = new LocalStorageWebProjectRepository(storage, now).getDraft(
    PROJECT_ID,
    REVISION,
  );

  assert.match(restored.files[0].source, /record latest/);
  assert.doesNotMatch(restored.files[0].source, /legacy stale/);
  assert.equal(JSON.parse(storage.getItem(WEB_PROJECT_STORAGE_KEY)).schemaVersion, 2);

  storage.setItem(
    WEB_PROJECT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts: [
        {
          projectId: PROJECT_ID,
          projectRevision: REVISION,
          files: createFiles("legacy newer"),
          updatedAt: "2026-08-18T13:00:00.000Z",
        },
      ],
      submissions: [],
      updatedAt: "2026-08-18T13:00:00.000Z",
    }),
  );

  const migratedNewer = new LocalStorageWebProjectRepository(storage, now).getDraft(
    PROJECT_ID,
    REVISION,
  );
  assert.match(migratedNewer.files[0].source, /record latest/);
  assert.doesNotMatch(migratedNewer.files[0].source, /legacy newer/);
});

test("손상된 JSON과 shape는 안전한 기본값으로 복구하고 유효한 항목만 남긴다", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageWebProjectRepository(storage, fixedNow);

  storage.setItem(WEB_PROJECT_STORAGE_KEY, "{broken");
  assert.deepEqual(repository.getState(), createEmptyWebProjectState());

  storage.setItem(
    WEB_PROJECT_STORAGE_KEY,
    JSON.stringify({ schemaVersion: 99, drafts: [], submissions: [] }),
  );
  assert.deepEqual(repository.getState(), createEmptyWebProjectState());

  const validDraft = {
    projectId: PROJECT_ID,
    projectRevision: REVISION,
    files: createFiles(),
    updatedAt: FIXED_INSTANT,
  };
  storage.setItem(
    WEB_PROJECT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      drafts: [
        { ...validDraft, projectRevision: 0 },
        validDraft,
        { ...validDraft, files: "broken" },
      ],
      submissions: [{ source: "저장되면 안 되는 값" }],
      updatedAt: "invalid-date",
    }),
  );

  const recovered = repository.getState();
  assert.equal(recovered.drafts.length, 1);
  assert.deepEqual(recovered.submissions, []);
  assert.equal(recovered.updatedAt, null);
  assert.equal(Object.isFrozen(recovered), true);
});

test("normalizeWebProjectState는 배열 오염과 prototype lookup을 저장 데이터로 채택하지 않는다", () => {
  const pollutedDrafts = [
    {
      projectId: PROJECT_ID,
      projectRevision: REVISION,
      files: createFiles(),
      updatedAt: FIXED_INSTANT,
    },
  ];
  pollutedDrafts.extra = "unexpected";

  const normalized = normalizeWebProjectState({
    schemaVersion: 1,
    drafts: pollutedDrafts,
    submissions: [],
    updatedAt: FIXED_INSTANT,
  });
  assert.deepEqual(normalized.drafts, []);
  assert.equal(normalized.constructor, Object);
});

test("저장소와 now 의존성을 검증하고 읽기 실패 시 빈 상태를 반환한다", () => {
  assert.throws(
    () => new LocalStorageWebProjectRepository({}),
    /호환되는 저장소/,
  );
  assert.throws(
    () => new LocalStorageWebProjectRepository(new MemoryStorage(), null),
    /현재 시각/,
  );

  const readFailureStorage = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {},
  };
  assert.deepEqual(
    new LocalStorageWebProjectRepository(readFailureStorage, fixedNow).getState(),
    createEmptyWebProjectState(),
  );

  const invalidNowRepository = new LocalStorageWebProjectRepository(
    new MemoryStorage(),
    () => new Date("invalid"),
  );
  assert.throws(
    () =>
      invalidNowRepository.saveDraft({
        projectId: PROJECT_ID,
        projectRevision: REVISION,
        files: createFiles(),
      }),
    /유효한 Date/,
  );
});
