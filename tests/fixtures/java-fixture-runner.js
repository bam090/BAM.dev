import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ALLOWED_JAVA_CONTRACT_TYPES = Object.freeze([
  "int",
  "boolean",
  "String",
  "int[]",
  "String[]",
]);

function assertType(condition, message) {
  if (!condition) throw new TypeError(message);
}

function javaStringLiteral(value) {
  assertType(typeof value === "string", "String 계약에는 문자열 값이 필요합니다.");
  return JSON.stringify(value)
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function toJavaLiteral(value, type) {
  assertType(ALLOWED_JAVA_CONTRACT_TYPES.includes(type), `허용되지 않은 Java 타입입니다: ${type}`);

  if (type === "int") {
    assertType(Number.isInteger(value), "int 계약에는 정수가 필요합니다.");
    assertType(value >= -2147483648 && value <= 2147483647, "int 범위를 벗어난 값입니다.");
    return String(value);
  }

  if (type === "boolean") {
    assertType(typeof value === "boolean", "boolean 계약에는 boolean 값이 필요합니다.");
    return String(value);
  }

  if (type === "String") return javaStringLiteral(value);

  assertType(Array.isArray(value), `${type} 계약에는 배열 값이 필요합니다.`);
  const elementType = type === "int[]" ? "int" : "String";
  return `new ${elementType}[]{${value.map((item) => toJavaLiteral(item, elementType)).join(", ")}}`;
}

function createHarnessSource({ entryPoint, parameterTypes, returnType, testCases }) {
  const caseBlocks = testCases.map((testCase) => {
    assertType(Array.isArray(testCase.args), `${testCase.id}: args 배열이 필요합니다.`);
    assertType(
      testCase.args.length === parameterTypes.length,
      `${testCase.id}: 함수 계약과 인수 개수가 다릅니다.`,
    );
    const args = testCase.args
      .map((argument, index) => toJavaLiteral(argument, parameterTypes[index]))
      .join(", ");
    const expected = toJavaLiteral(testCase.expected, returnType);
    const id = javaStringLiteral(testCase.id);

    return `    try {
      Object actual = Solution.${entryPoint}(${args});
      Object expected = ${expected};
      if (!java.util.Objects.deepEquals(actual, expected)) {
        failing.add(${id});
      }
    } catch (Throwable error) {
      failing.add(${id} + ":threw:" + error.getClass().getSimpleName());
    }`;
  });

  return `public class FixtureHarness {
  public static void main(String[] args) {
    java.util.List<String> failing = new java.util.ArrayList<>();
${caseBlocks.join("\n")}
    System.out.println("BAM_RESULT_BEGIN");
    for (String id : failing) {
      System.out.println(id);
    }
    System.out.println("BAM_RESULT_END");
  }
}
`;
}

function formatProcessError(error, command) {
  const stdout = typeof error?.stdout === "string" ? error.stdout.trim() : "";
  const stderr = typeof error?.stderr === "string" ? error.stderr.trim() : "";
  return new Error(
    [
      `${command} 실행에 실패했습니다.`,
      stderr && `stderr:\n${stderr}`,
      stdout && `stdout:\n${stdout}`,
    ]
      .filter(Boolean)
      .join("\n"),
    { cause: error },
  );
}

export async function runJavaFixtureCases({
  source,
  entryPoint,
  parameterTypes,
  returnType,
  testCases,
}) {
  assertType(typeof source === "string" && source.trim(), "Java source가 필요합니다.");
  assertType(/\bpublic\s+class\s+Solution\b/.test(source), "public class Solution이 필요합니다.");
  assertType(
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(entryPoint),
    `올바르지 않은 Java 메서드 이름입니다: ${entryPoint}`,
  );

  const directory = await mkdtemp(path.join(tmpdir(), "bam-java-fixture-"));
  const solutionPath = path.join(directory, "Solution.java");
  const harnessPath = path.join(directory, "FixtureHarness.java");
  const harness = createHarnessSource({ entryPoint, parameterTypes, returnType, testCases });

  try {
    await Promise.all([
      writeFile(solutionPath, source, "utf8"),
      writeFile(harnessPath, harness, "utf8"),
    ]);

    try {
      await execFileAsync(
        "javac",
        ["--release", "21", "-encoding", "UTF-8", "Solution.java", "FixtureHarness.java"],
        { cwd: directory, timeout: 15_000, maxBuffer: 1024 * 1024 },
      );
    } catch (error) {
      throw formatProcessError(error, "javac --release 21");
    }

    let stdout;
    try {
      ({ stdout } = await execFileAsync("java", ["-cp", directory, "FixtureHarness"], {
        cwd: directory,
        timeout: 5_000,
        maxBuffer: 1024 * 1024,
      }));
    } catch (error) {
      throw formatProcessError(error, "java FixtureHarness");
    }

    const lines = stdout.split(/\r?\n/);
    const start = lines.lastIndexOf("BAM_RESULT_BEGIN");
    const end = lines.indexOf("BAM_RESULT_END", start + 1);
    if (start < 0 || end < 0) {
      throw new Error(`Java fixture 결과 표식을 찾을 수 없습니다.\n${stdout}`);
    }
    return lines.slice(start + 1, end).filter(Boolean);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
