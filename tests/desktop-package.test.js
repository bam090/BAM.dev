import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  cp,
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { treeHash } from "../scripts/desktop-build.mjs";
import {
  packageDesktopApp,
  parsePackageArgs,
} from "../scripts/desktop-package.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageSource = await readFile(
  new URL("../scripts/desktop-package.mjs", import.meta.url),
  "utf8",
);

const PROVENANCE = Object.freeze({
  runtimeLockSha256: "1".repeat(64),
  questProvenanceSha256: "2".repeat(64),
  codingTestProvenanceSha256: "3".repeat(64),
});

async function createFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "bam-desktop-package-test-"));
  const sourceAppPath = path.join(root, "source", "BAM.dev.app");
  const outputParent = path.join(root, "output");
  const outputDmgPath = path.join(outputParent, "BAM.dev.dmg");
  await mkdir(path.join(sourceAppPath, "Contents", "Resources"), {
    recursive: true,
  });
  await mkdir(outputParent);
  await writeFile(
    path.join(sourceAppPath, "Contents", "Info.plist"),
    "fixture plist",
  );
  await writeFile(
    path.join(sourceAppPath, "Contents", "Resources", "payload.txt"),
    "immutable payload",
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  return {
    root,
    sourceAppPath,
    outputParent,
    outputDmgPath,
    receiptPath: `${outputDmgPath}.receipt.json`,
  };
}

function commandName(executable, args) {
  if (executable === "/usr/bin/codesign") {
    return args[0] === "--display" ? "signature" : "codesign-verify";
  }
  if (executable === "/usr/bin/plutil") return `plutil:${args[1]}`;
  if (executable === "/usr/bin/hdiutil") return `hdiutil:${args[0]}`;
  return executable;
}

function createFakeCommands({ failAt = null, onVerify = null } = {}) {
  const calls = [];
  const runCommand = async (executable, args) => {
    const name = commandName(executable, args);
    calls.push({ executable, args: [...args], name });
    if (name === failAt) {
      throw Object.assign(new Error(`${name} failed`), {
        code: 23,
        signal: null,
        stdout: `${name} stdout`,
        stderr: `${name} stderr`,
      });
    }
    if (name === "signature") return { stdout: "", stderr: "Signature=adhoc\n" };
    if (name === "plutil:CFBundleIdentifier") {
      return { stdout: "dev.bam.prototype\n", stderr: "" };
    }
    if (name === "plutil:CFBundleName") {
      return { stdout: "BAM.dev\n", stderr: "" };
    }
    if (name === "hdiutil:create") {
      await writeFile(args.at(-1), "fake UDZO image");
    }
    if (name === "hdiutil:verify") await onVerify?.(args.at(-1));
    return { stdout: "", stderr: "" };
  };
  return { calls, runCommand };
}

function deps(overrides = {}) {
  const commands = createFakeCommands(overrides);
  const copyCalls = [];
  return {
    commands,
    copyCalls,
    value: {
      runCommand: commands.runCommand,
      async verifyProvenance() {
        return PROVENANCE;
      },
      async copyApp(source, destination, options) {
        copyCalls.push({ source, destination, options });
        await cp(source, destination, options);
      },
      platform: "darwin",
      arch: "arm64",
    },
  };
}

function loadPackageDesktopAppWithLink(injectedLink) {
  const cliStart = packageSource.indexOf("\nif (process.argv[1]");
  assert.ok(cliStart > 0, "desktop package CLI 경계를 찾을 수 없습니다.");
  const source = packageSource
    .slice(0, cliStart)
    .replace(/^import .*\n/gmu, "")
    .replace(
      /const projectRoot = .*\n/u,
      `const projectRoot = ${JSON.stringify(projectRoot)};\n`,
    )
    .replace(
      /const execFileAsync = .*\n/u,
      "const execFileAsync = async () => { throw new Error('native command forbidden'); };\n",
    )
    .replace("export function parsePackageArgs", "function parsePackageArgs")
    .replace("export async function packageDesktopApp", "async function packageDesktopApp");
  const factory = runInNewContext(
    `(function (bindings) {
      const {
        createHash, createReadStream, cp, link, lstat, mkdir, mkdtemp,
        readFile, realpath, rm, stat, unlink, writeFile, path,
        assertSafeTree, treeHash, verifyRunnerProvenance, verifyCodingTestBundle
      } = bindings;
      ${source}
      return packageDesktopApp;
    })`,
    { process },
    { filename: "desktop-package.mjs" },
  );
  return factory({
    createHash,
    createReadStream,
    cp,
    link: injectedLink,
    lstat,
    mkdir,
    mkdtemp,
    readFile,
    realpath,
    rm,
    stat,
    unlink,
    writeFile,
    path,
    assertSafeTree: async (rootPath) => {
      const { assertSafeTree } = await import("../scripts/desktop-build.mjs");
      return assertSafeTree(rootPath);
    },
    treeHash,
    verifyRunnerProvenance: async () => {},
    verifyCodingTestBundle: async () => {},
  });
}

async function assertNoStaging(outputParent) {
  assert.deepEqual(
    (await readdir(outputParent)).filter((name) => name.startsWith(".bam-package-")),
    [],
  );
}

test("desktop package 인자는 app·output 한 쌍만 허용한다", () => {
  assert.deepEqual(
    parsePackageArgs(["--output", "BAM.dmg", "--app", "BAM.app"]),
    { sourceAppPath: "BAM.app", outputDmgPath: "BAM.dmg" },
  );
  for (const argv of [
    [],
    ["--app", "BAM.app"],
    ["--app", "BAM.app", "--app", "again.app"],
    ["--app", "BAM.app", "--unknown", "BAM.dmg"],
    ["--app", "--output", "--output", "BAM.dmg"],
  ]) {
    assert.throws(() => parsePackageArgs(argv), /사용법/u);
  }
});

test("입력·출력 경계는 symlink root·중첩·기존 DMG와 receipt를 실행 전에 거부한다", async (t) => {
  await t.test("symlink app root", async (t) => {
    const fixture = await createFixture(t);
    const linkedApp = path.join(fixture.root, "linked.app");
    await symlink(fixture.sourceAppPath, linkedApp);
    const fake = deps();
    await assert.rejects(
      packageDesktopApp(
        { sourceAppPath: linkedApp, outputDmgPath: fixture.outputDmgPath },
        fake.value,
      ),
      /실제 \.app 디렉터리/u,
    );
    assert.equal(fake.commands.calls.length, 0);
    assert.equal(fake.copyCalls.length, 0);
  });

  await t.test("output nested in app", async (t) => {
    const fixture = await createFixture(t);
    const nestedParent = path.join(fixture.sourceAppPath, "exports");
    await mkdir(nestedParent);
    const fake = deps();
    await assert.rejects(
      packageDesktopApp(
        {
          sourceAppPath: fixture.sourceAppPath,
          outputDmgPath: path.join(nestedParent, "BAM.dev.dmg"),
        },
        fake.value,
      ),
      /앱 내부/u,
    );
    assert.equal(fake.commands.calls.length, 0);
    assert.equal(fake.copyCalls.length, 0);
  });

  for (const existing of ["dmg", "receipt"]) {
    await t.test(`existing ${existing}`, async (t) => {
      const fixture = await createFixture(t);
      const existingPath = existing === "dmg"
        ? fixture.outputDmgPath
        : fixture.receiptPath;
      await writeFile(existingPath, `keep-${existing}`);
      const fake = deps();
      await assert.rejects(
        packageDesktopApp(
          {
            sourceAppPath: fixture.sourceAppPath,
            outputDmgPath: fixture.outputDmgPath,
          },
          fake.value,
        ),
        /기존 출력은 덮어쓰지 않습니다/u,
      );
      assert.equal(await readFile(existingPath, "utf8"), `keep-${existing}`);
      assert.equal(fake.commands.calls.length, 0);
      assert.equal(fake.copyCalls.length, 0);
    });
  }
});

test("서명·provenance·identity gate 실패는 복사와 DMG 생성을 시작하지 않는다", async (t) => {
  const gates = [
    {
      name: "unsafe tree",
      prepare: async (fixture) => {
        await symlink(
          path.join(fixture.root, "outside"),
          path.join(fixture.sourceAppPath, "Contents", "escape"),
        );
      },
      expected: /symlink/u,
    },
    { name: "signature verify", failAt: "codesign-verify", expected: /failed/u },
    {
      name: "adhoc identity",
      commandOverride: async (executable, args, original) => {
        if (commandName(executable, args) === "signature") {
          return { stdout: "", stderr: "Signature=Developer ID\n" };
        }
        return original(executable, args);
      },
      expected: /ad-hoc 서명/u,
    },
    ...["runtime lock", "Quest provenance", "CT provenance"].map((name) => ({
      name,
      provenanceError: new Error(`${name} mismatch`),
      expected: new RegExp(name, "u"),
    })),
    {
      name: "bundle identity",
      commandOverride: async (executable, args, original) => {
        if (commandName(executable, args) === "plutil:CFBundleIdentifier") {
          return { stdout: "invalid.bundle\n", stderr: "" };
        }
        return original(executable, args);
      },
      expected: /identity/u,
    },
  ];

  for (const gate of gates) {
    await t.test(gate.name, async (t) => {
      const fixture = await createFixture(t);
      await gate.prepare?.(fixture);
      const fake = deps({ failAt: gate.failAt });
      if (gate.commandOverride) {
        const original = fake.value.runCommand;
        fake.value.runCommand = (executable, args) =>
          gate.commandOverride(executable, args, original);
      }
      if (gate.provenanceError) {
        fake.value.verifyProvenance = async () => {
          throw gate.provenanceError;
        };
      }

      await assert.rejects(
        packageDesktopApp(
          {
            sourceAppPath: fixture.sourceAppPath,
            outputDmgPath: fixture.outputDmgPath,
          },
          fake.value,
        ),
        gate.expected,
      );
      assert.equal(fake.copyCalls.length, 0);
      assert.equal(
        fake.commands.calls.filter(({ name }) => name === "hdiutil:create").length,
        0,
      );
      await assert.rejects(lstat(fixture.outputDmgPath), { code: "ENOENT" });
      await assert.rejects(lstat(fixture.receiptPath), { code: "ENOENT" });
      await assertNoStaging(fixture.outputParent);
    });
  }
});

test("copy·create·verify·exclusive publish 실패는 staging과 이번 산출물만 정리한다", async (t) => {
  for (const failure of ["copy", "create", "verify", "publish"]) {
    await t.test(failure, async (t) => {
      const fixture = await createFixture(t);
      const fake = deps({
        failAt: failure === "create"
          ? "hdiutil:create"
          : failure === "verify" ? "hdiutil:verify" : null,
        onVerify: failure === "publish"
          ? async () => writeFile(fixture.receiptPath, "concurrent receipt")
          : null,
      });
      const copyFailure = new Error("copy failed");
      if (failure === "copy") {
        fake.value.copyApp = async () => {
          throw copyFailure;
        };
      }

      await assert.rejects(
        packageDesktopApp(
          {
            sourceAppPath: fixture.sourceAppPath,
            outputDmgPath: fixture.outputDmgPath,
          },
          fake.value,
        ),
        (error) => {
          if (failure === "copy") assert.equal(error, copyFailure);
          if (failure === "create" || failure === "verify") {
            assert.equal(error.commandResult.exitCode, 23);
            assert.match(error.commandResult.stderr, /stderr/u);
          }
          if (failure === "publish") assert.equal(error.code, "EEXIST");
          return true;
        },
      );
      await assert.rejects(lstat(fixture.outputDmgPath), { code: "ENOENT" });
      if (failure === "publish") {
        assert.equal(await readFile(fixture.receiptPath, "utf8"), "concurrent receipt");
      } else {
        await assert.rejects(lstat(fixture.receiptPath), { code: "ENOENT" });
      }
      await assertNoStaging(fixture.outputParent);
    });
  }
});

test("receipt 게시 충돌 전에 DMG가 교체되면 rollback은 교체 파일을 삭제하지 않는다", async (t) => {
  const fixture = await createFixture(t);
  const replacement = "concurrent replacement DMG";
  const competingReceipt = "concurrent receipt";
  let linkCalls = 0;
  const injectedLink = async (source, destination) => {
    linkCalls += 1;
    if (linkCalls === 1) {
      await link(source, destination);
      await unlink(destination);
      await writeFile(destination, replacement);
      await writeFile(fixture.receiptPath, competingReceipt);
      return;
    }
    return link(source, destination);
  };
  const packageWithInjectedLink = loadPackageDesktopAppWithLink(injectedLink);
  const fake = deps();

  await assert.rejects(
    packageWithInjectedLink(
      {
        sourceAppPath: fixture.sourceAppPath,
        outputDmgPath: fixture.outputDmgPath,
      },
      fake.value,
    ),
    (error) => {
      assert.equal(error.code, "EEXIST");
      return true;
    },
  );

  assert.equal(linkCalls, 2);
  assert.equal(await readFile(fixture.outputDmgPath, "utf8"), replacement);
  assert.equal(await readFile(fixture.receiptPath, "utf8"), competingReceipt);
  await assertNoStaging(fixture.outputParent);
});

test("성공은 원본과 복사 hash를 고정하고 UDZO 검증 뒤 DMG·receipt를 exclusive 게시한다", async (t) => {
  const fixture = await createFixture(t);
  const canonicalSourceAppPath = await realpath(fixture.sourceAppPath);
  const canonicalOutputParent = await realpath(fixture.outputParent);
  const canonicalDmgPath = path.join(
    canonicalOutputParent,
    path.basename(fixture.outputDmgPath),
  );
  const canonicalReceiptPath = `${canonicalDmgPath}.receipt.json`;
  const sourceHash = await treeHash(fixture.sourceAppPath);
  const fake = deps();

  const result = await packageDesktopApp(
    {
      sourceAppPath: fixture.sourceAppPath,
      outputDmgPath: fixture.outputDmgPath,
    },
    fake.value,
  );

  assert.deepEqual(result, {
    dmgPath: canonicalDmgPath,
    receiptPath: canonicalReceiptPath,
  });
  assert.equal(await treeHash(fixture.sourceAppPath), sourceHash);
  assert.equal(fake.copyCalls.length, 1);
  assert.equal(fake.copyCalls[0].source, canonicalSourceAppPath);
  assert.deepEqual(
    fake.commands.calls.map(({ name }) => name),
    [
      "codesign-verify",
      "signature",
      "plutil:CFBundleIdentifier",
      "plutil:CFBundleName",
      "codesign-verify",
      "hdiutil:create",
      "hdiutil:verify",
    ],
  );
  const createCall = fake.commands.calls.find(({ name }) => name === "hdiutil:create");
  assert.deepEqual(createCall.args.slice(0, -1), [
    "create",
    "-srcfolder",
    path.dirname(fake.copyCalls[0].destination),
    "-volname",
    "BAM.dev",
    "-format",
    "UDZO",
  ]);

  const dmg = await readFile(fixture.outputDmgPath);
  const receipt = JSON.parse(await readFile(fixture.receiptPath, "utf8"));
  assert.equal(dmg.length > 0, true);
  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.status, "LOCAL_PROTOTYPE_DMG_PACKAGED_NOT_INSTALLATION_VALIDATED");
  assert.deepEqual(receipt.sourceApp, {
    path: canonicalSourceAppPath,
    treeSha256: sourceHash,
    unchanged: true,
  });
  assert.deepEqual(receipt.identity, {
    CFBundleIdentifier: "dev.bam.prototype",
    CFBundleName: "BAM.dev",
  });
  assert.deepEqual(receipt.provenance, PROVENANCE);
  assert.deepEqual(receipt.dmg, {
    path: canonicalDmgPath,
    format: "UDZO",
    size: dmg.length,
    sha256: createHash("sha256").update(dmg).digest("hex"),
  });
  assert.equal(receipt.commands.length, 7);
  assert.equal(receipt.signing, "Existing local ad-hoc signature verified; not re-signed");
  assert.equal(receipt.notarization, "Not performed");
  assert.match(receipt.distribution, /Local prototype only/u);
  assert.deepEqual(receipt.notValidated, [
    "Installation",
    "Offline first launch",
    "Repackaging data preservation",
    "Official OS or packaging support",
  ]);
  await assertNoStaging(fixture.outputParent);
});
