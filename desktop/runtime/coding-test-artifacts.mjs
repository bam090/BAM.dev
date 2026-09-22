import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = dirname(fileURLToPath(import.meta.url));
export const CT_EVALUATION_KIND = "java-junit-method-v1";
export const CT_RUNNER_CLASS = "BamCodingTestRunner";
export const CT_JUNIT = Object.freeze({
  version: "6.1.3",
  file: "junit-platform-console-standalone-6.1.3.jar",
  size: 2997949,
  sha256: "e62b96ac475dbcde8599ea905d088f65d90778f86e259b856a49fa5c4ea256ec",
});
const types = new Set(["int", "long", "double", "boolean", "String", "int[]", "long[]", "double[]", "String[]", "int[][]", "String[][]", "boolean[][]"]);
const identifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;
const idPattern = /^[a-z][a-z0-9-]*$/u;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function oneMatch(source, pattern, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`CT source mapping is ambiguous: ${label}`);
  return matches[0];
}

function parameterType(value) {
  const match = value.trim().match(/^(\w+(?:\[\])*)\s+(\w+)$/u);
  if (!match || !types.has(match[1]) || !identifier.test(match[2])) throw new Error("Invalid CT parameter declaration");
  return match[1].replace(/^String/u, "java.lang.String");
}

// Only the installed public collection supplies selectors and adapter signatures.
export function createCodingTestArtifacts(collection) {
  if (collection?.languageId !== "java" || collection.contractVersion !== 1 || !Array.isArray(collection.problems) || collection.problems.length !== 72) {
    throw new Error("CT collection must contain the approved Java72 problems");
  }
  const sources = {};
  const seenIds = new Set();
  const problems = collection.problems.map((problem) => {
    if (!idPattern.test(problem.id) || !problem.id.startsWith("coding-test-java-") || seenIds.has(problem.id) || !Number.isSafeInteger(problem.revision) || problem.revision < 1) throw new Error("Invalid CT problem identity");
    seenIds.add(problem.id);
    if (problem.entryPoint !== "solve" || problem.javaContract?.sourceFile !== "Solution.java" || problem.javaContract.className !== "Solution") throw new Error("Invalid CT learner contract");
    const parameters = problem.functionContract.parameters;
    const returnType = problem.functionContract.returns.type;
    if (!types.has(returnType) || !Array.isArray(parameters) || parameters.some((p) => !types.has(p.type) || !identifier.test(p.name))) throw new Error("Invalid CT typed signature");
    const source = problem.publicTestSource;
    if (typeof source !== "string" || Buffer.byteLength(source) > 12 * 1024) throw new Error("Invalid CT public source");
    const testPackage = oneMatch(source, /^package\s+([\w.]+);/gmu, problem.id)[1];
    const testName = oneMatch(source, /^(?:public\s+)?(?:final\s+)?class\s+(\w+)\s*\{/gmu, problem.id)[1];
    const solutionClass = oneMatch(source, /^import\s+(bridge\.[\w.]+\.solution\.\w+);/gmu, problem.id)[1];
    const testClass = `${testPackage}.${testName}`;
    if (![testClass, solutionClass].every((name) => name.split(".").every((part) => identifier.test(part)))) throw new Error("Invalid CT class name");
    if (!Array.isArray(problem.publicTests) || problem.publicTests.length < 1 || problem.publicTests.length > 6) throw new Error("Invalid CT public groups");
    const methodNames = new Set();
    const tests = problem.publicTests.map((test) => {
      if (!idPattern.test(test.id) || seenIds.has(test.id) || typeof test.label !== "string" || !test.label) throw new Error("Invalid CT test identity");
      seenIds.add(test.id);
      if (!source.includes(test.assertionSource)) throw new Error("CT assertion is not original public source");
      const method = oneMatch(test.assertionSource, /\bvoid\s+(\w+)\s*\(([^)]*)\)/gu, test.id);
      if (methodNames.has(method[1]) || !/@(?:Test|ParameterizedTest)\b/u.test(test.assertionSource)) throw new Error("Ambiguous CT public method");
      methodNames.add(method[1]);
      return { id: test.id, label: test.label, testClass, method: method[1], parameterTypes: method[2].trim() ? method[2].split(",").map(parameterType) : [], assertionSource: test.assertionSource };
    });
    const dot = solutionClass.lastIndexOf(".");
    const adapter = `package ${solutionClass.slice(0, dot)};\n\npublic final class ${solutionClass.slice(dot + 1)} {\n    private ${solutionClass.slice(dot + 1)}() {}\n    public static ${returnType} solve(${parameters.map((p) => `${p.type} ${p.name}`).join(", ")}) {\n        return (${returnType}) dev.bam.runtime.SolutionInvoker.invoke(\n            ${returnType}.class, new Class<?>[]{${parameters.map((p) => `${p.type}.class`).join(", ")}},\n            new Object[]{${parameters.map((p) => p.name).join(", ")}});\n    }\n}\n`;
    for (const [name, text] of [[testClass, source], [solutionClass, adapter]]) {
      const file = `sources/${name.replaceAll(".", "/")}.java`;
      if (Object.hasOwn(sources, file)) throw new Error("Duplicate CT source path");
      sources[file] = text;
    }
    return { id: problem.id, revision: problem.revision, entryPoint: "solve", parameters: parameters.map(({ name, type }) => ({ name, type })), returnType, solutionClass, publicSourceSha256: hash(source), runTestIds: [tests[0].id], tests };
  });
  return { manifest: { schemaVersion: 1, contractVersion: 1, languageId: "java", evaluationKind: CT_EVALUATION_KIND, collectionSha256: hash(JSON.stringify(collection)), problems }, sources };
}

export async function codingTestCodeHashes(sourceRoot = moduleRoot) {
  const result = {};
  for (const name of ["coding-test-artifacts.mjs", "JavaBamCodingTestRunner.java", "SolutionInvoker.java"]) result[name] = hash(await readFile(join(sourceRoot, name)));
  return result;
}

export async function codingTestBundleFiles(root) {
  if (!(await lstat(root)).isDirectory()) throw new Error("CT root must be a regular directory");
  const files = [];
  const pending = [root];
  while (pending.length) {
    const directory = pending.pop();
    for (const name of await readdir(directory)) {
      const file = join(directory, name);
      const metadata = await lstat(file);
      if (metadata.isSymbolicLink()) throw new Error("CT artifacts cannot contain symlinks");
      if (metadata.isDirectory()) { pending.push(file); continue; }
      if (!metadata.isFile()) throw new Error("CT artifact must be a regular file");
      const filePath = relative(root, file).replaceAll("\\", "/");
      if (filePath === "ct-provenance.json") continue;
      files.push({ path: filePath, sha256: hash(await readFile(file)) });
    }
  }
  return files.sort((a, b) => a.path < b.path ? -1 : 1);
}

export async function verifyCodingTestBundle(root, collection, sourceRoot = moduleRoot) {
  const files = await codingTestBundleFiles(root);
  const receiptPath = join(root, "ct-provenance.json");
  if (!(await lstat(receiptPath)).isFile()) throw new Error("CT provenance must be a regular file");
  const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
  const { manifest, sources } = createCodingTestArtifacts(collection);
  if (receipt.schemaVersion !== 1 || receipt.provenance?.kind !== "bundled-javac" || receipt.provenance.release !== 25
    || !/^[a-f0-9]{64}$/u.test(receipt.provenance.javacSha256 ?? "")
    || JSON.stringify(receipt.codeHashes) !== JSON.stringify(await codingTestCodeHashes(sourceRoot))
    || JSON.stringify(receipt.files) !== JSON.stringify(files)
    || JSON.stringify(receipt.junit) !== JSON.stringify(CT_JUNIT)
    || JSON.stringify(receipt.provenance.runtimeClasspath) !== JSON.stringify(["classes", CT_JUNIT.file, "<fresh-learner-classes>"])
    || await readFile(join(root, "ct-manifest.json"), "utf8") !== json(manifest)) throw new Error("CT bundle provenance mismatch");
  for (const [file, text] of Object.entries(sources)) if (await readFile(join(root, file), "utf8") !== text) throw new Error("CT original source or adapter changed");
  for (const name of ["JavaBamCodingTestRunner.java", "SolutionInvoker.java"]) {
    if (!Buffer.from(await readFile(join(root, "sources", name))).equals(await readFile(join(sourceRoot, name)))) throw new Error("CT runner build source changed");
  }
  const junit = files.find((file) => file.path === CT_JUNIT.file);
  if (junit?.sha256 !== CT_JUNIT.sha256 || (await lstat(join(root, CT_JUNIT.file))).size !== CT_JUNIT.size) throw new Error("CT JUnit artifact mismatch");
  for (const name of [CT_RUNNER_CLASS, "dev.bam.runtime.SolutionInvoker", ...manifest.problems.flatMap((p) => [p.solutionClass, p.tests[0].testClass])]) {
    if (!files.some((file) => file.path === `classes/${name.replaceAll(".", "/")}.class`)) throw new Error(`CT class missing: ${name}`);
  }
  return manifest;
}
