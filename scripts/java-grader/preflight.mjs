const TOP_LEVEL_TYPE_KEYWORDS = new Set(["class", "interface", "enum", "record"]);
const HARNESS_RESERVED_TYPE_NAMES = new Set([
  "BamJavaHarness",
  "Base64",
  "Boolean",
  "BufferedReader",
  "Character",
  "IllegalArgumentException",
  "InputStreamReader",
  "Integer",
  "StandardCharsets",
  "String",
  "StringBuilder",
  "System",
  "Throwable",
  "java",
]);
const BLOCKED_IDENTIFIERS = new Map([
  ["Runtime", "Runtime API"],
  ["ProcessBuilder", "프로세스 실행 API"],
  ["ProcessHandle", "프로세스 조회 API"],
  ["SecurityManager", "Security Manager API"],
  ["File", "파일 API"],
  ["Files", "파일 API"],
  ["Path", "파일 경로 API"],
  ["Paths", "파일 경로 API"],
  ["FileSystem", "파일 시스템 API"],
  ["FileSystems", "파일 시스템 API"],
  ["FileInputStream", "파일 입력 API"],
  ["FileOutputStream", "파일 출력 API"],
  ["FileReader", "파일 입력 API"],
  ["FileWriter", "파일 출력 API"],
  ["RandomAccessFile", "파일 API"],
  ["Socket", "네트워크 API"],
  ["ServerSocket", "네트워크 API"],
  ["DatagramSocket", "네트워크 API"],
  ["DatagramPacket", "네트워크 API"],
  ["InetAddress", "네트워크 API"],
  ["URL", "네트워크 API"],
  ["URI", "네트워크 API"],
  ["URLConnection", "네트워크 API"],
  ["HttpClient", "네트워크 API"],
  ["ClassLoader", "클래스 로더 API"],
  ["MethodHandles", "reflection API"],
  ["AccessibleObject", "reflection API"],
  ["Unsafe", "JVM 내부 메모리 API"],
  ["VirtualMachine", "JVM attach API"],
  ["Thread", "추가 스레드 API"],
  ["Executors", "추가 스레드 API"],
  ["ForkJoinPool", "추가 스레드 API"],
]);
const BLOCKED_MEMBER_NAMES = new Set([
  "defineClass",
  "forName",
  "getClassLoader",
  "getDeclaredConstructor",
  "getDeclaredConstructors",
  "getDeclaredField",
  "getDeclaredFields",
  "getDeclaredMethod",
  "getDeclaredMethods",
  "getMethod",
  "getMethods",
  "invoke",
  "loadClass",
  "newInstance",
  "setAccessible",
  "trySetAccessible",
]);

function blank(char) {
  return char === "\n" || char === "\r" ? char : " ";
}

/**
 * Replaces comments, string literals, character literals, and text blocks with
 * whitespace before token checks. This avoids rejecting a lesson comment or
 * learner-facing string merely because it mentions a blocked API.
 */
export function stripJavaCommentsAndLiterals(source) {
  let state = "code";
  let output = "";

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    const nextTwo = source.slice(index, index + 3);

    if (state === "code") {
      if (char === "/" && next === "/") {
        output += "  ";
        index += 1;
        state = "line-comment";
      } else if (char === "/" && next === "*") {
        output += "  ";
        index += 1;
        state = "block-comment";
      } else if (nextTwo === '\"\"\"') {
        output += "   ";
        index += 2;
        state = "text-block";
      } else if (char === '"') {
        output += " ";
        state = "string";
      } else if (char === "'") {
        output += " ";
        state = "character";
      } else {
        output += char;
      }
      continue;
    }

    if (state === "line-comment") {
      output += blank(char);
      if (char === "\n" || char === "\r") state = "code";
      continue;
    }

    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        output += "  ";
        index += 1;
        state = "code";
      } else {
        output += blank(char);
      }
      continue;
    }

    if (state === "text-block") {
      if (nextTwo === '\"\"\"') {
        output += "   ";
        index += 2;
        state = "code";
      } else {
        output += blank(char);
      }
      continue;
    }

    output += blank(char);
    if (char === "\\" && index + 1 < source.length) {
      output += blank(source[index + 1]);
      index += 1;
    } else if (
      (state === "string" && char === '"') ||
      (state === "character" && char === "'")
    ) {
      state = "code";
    }
  }

  return output;
}

function tokenize(source) {
  return source.match(/[A-Za-z_$][A-Za-z0-9_$]*|[{}.;@]/gu) ?? [];
}

function includesSequence(tokens, sequence) {
  for (let index = 0; index <= tokens.length - sequence.length; index += 1) {
    if (sequence.every((token, offset) => tokens[index + offset] === token)) return true;
  }
  return false;
}

function findPublicTopLevelTypes(tokens) {
  const declarations = [];
  let braceDepth = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "{") {
      braceDepth += 1;
      continue;
    }
    if (token === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }
    if (braceDepth !== 0 || token !== "public") continue;

    for (let cursor = index + 1; cursor < tokens.length; cursor += 1) {
      const candidate = tokens[cursor];
      if (["{", "}", ";"].includes(candidate)) break;
      if (!TOP_LEVEL_TYPE_KEYWORDS.has(candidate)) continue;
      declarations.push({ kind: candidate, name: tokens[cursor + 1] ?? "" });
      break;
    }
  }
  return declarations;
}

function findDeclaredTypeNames(tokens) {
  const names = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (TOP_LEVEL_TYPE_KEYWORDS.has(tokens[index])) names.push(tokens[index + 1]);
  }
  return names;
}

export function inspectJavaSourcePreflight(source) {
  if (typeof source !== "string" || source.trim().length === 0) {
    return ["Java 소스는 비어 있지 않은 문자열이어야 합니다."];
  }

  const codeOnly = stripJavaCommentsAndLiterals(source);
  const tokens = tokenize(codeOnly);
  const issues = [];

  // Java translates Unicode escapes before lexical analysis, so an escape can
  // manufacture a comment terminator or blocked identifier. The local grader
  // deliberately rejects this uncommon source notation before token checks.
  if (/\\u+[0-9a-f]{4}/iu.test(source)) {
    issues.push("Java Unicode escape 표기(\\uNNNN)는 사용할 수 없습니다.");
  }

  if (tokens.includes("package")) {
    issues.push("package 선언은 사용할 수 없습니다.");
  }
  if (tokens.includes("native")) {
    issues.push("native 선언은 사용할 수 없습니다.");
  }

  const publicTypes = findPublicTopLevelTypes(tokens);
  if (
    publicTypes.length !== 1 ||
    publicTypes[0].kind !== "class" ||
    publicTypes[0].name !== "Solution"
  ) {
    issues.push(
      "소스에는 public top-level 타입으로 public class Solution 하나만 있어야 합니다.",
    );
  }

  if (findDeclaredTypeNames(tokens).some((name) => HARNESS_RESERVED_TYPE_NAMES.has(name))) {
    issues.push("채점 harness가 사용하는 예약 타입 이름은 선언할 수 없습니다.");
  }

  if (includesSequence(tokens, ["System", ".", "exit"])) {
    issues.push("System.exit은 사용할 수 없습니다.");
  }
  if (
    includesSequence(tokens, ["System", ".", "load"]) ||
    includesSequence(tokens, ["System", ".", "loadLibrary"])
  ) {
    issues.push("System.load와 System.loadLibrary는 사용할 수 없습니다.");
  }
  if (
    includesSequence(tokens, ["System", ".", "getenv"]) ||
    includesSequence(tokens, ["System", ".", "getProperties"]) ||
    includesSequence(tokens, ["System", ".", "getProperty"])
  ) {
    issues.push("시스템 환경·속성 조회 API는 사용할 수 없습니다.");
  }
  if (
    includesSequence(tokens, ["System", ".", "setIn"]) ||
    includesSequence(tokens, ["System", ".", "setOut"]) ||
    includesSequence(tokens, ["System", ".", "setErr"]) ||
    includesSequence(tokens, ["System", ".", "in"])
  ) {
    issues.push("시스템 표준 입출력 교체·입력 API는 사용할 수 없습니다.");
  }

  const blockedPackages = [
    ["java", ".", "io"],
    ["java", ".", "net"],
    ["java", ".", "nio", ".", "file"],
    ["java", ".", "lang", ".", "reflect"],
    ["java", ".", "lang", ".", "invoke"],
    ["jdk", ".", "internal"],
    ["jdk", ".", "attach"],
    ["com", ".", "sun", ".", "tools", ".", "attach"],
    ["sun", "."],
  ];
  if (blockedPackages.some((sequence) => includesSequence(tokens, sequence))) {
    issues.push("파일·네트워크·reflection 내부 패키지는 사용할 수 없습니다.");
  }

  const reportedApis = new Set();
  for (const token of tokens) {
    const label = BLOCKED_IDENTIFIERS.get(token);
    if (label) reportedApis.add(label);
    if (BLOCKED_MEMBER_NAMES.has(token)) reportedApis.add("reflection 또는 클래스 로딩 API");
  }
  for (const label of reportedApis) {
    issues.push(`${label}는 사용할 수 없습니다.`);
  }

  return [...new Set(issues)];
}
