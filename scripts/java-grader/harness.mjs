function toJavaStringLiteral(value) {
  if (value === null) return "null";
  let result = '"';
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    const char = value[index];
    if (char === '"') result += '\\"';
    else if (char === "\\") result += "\\\\";
    else if (char === "\b") result += "\\b";
    else if (char === "\t") result += "\\t";
    else if (char === "\n") result += "\\n";
    else if (char === "\f") result += "\\f";
    else if (char === "\r") result += "\\r";
    else if (codeUnit < 0x20 || codeUnit > 0x7e) {
      result += `\\u${codeUnit.toString(16).padStart(4, "0")}`;
    } else result += char;
  }
  return `${result}\"`;
}

function toJavaValue(type, value) {
  if (value === null) return "null";
  if (type === "int") return String(value);
  if (type === "boolean") return value ? "true" : "false";
  if (type === "String") return toJavaStringLiteral(value);
  if (type === "int[]") {
    return `new int[]{${value.map((item) => String(item)).join(",")}}`;
  }
  if (type === "String[]") {
    return `new String[]{${value.map(toJavaStringLiteral).join(",")}}`;
  }
  throw new TypeError(`지원하지 않는 Java harness 타입입니다: ${type}`);
}

function createTestCases(request) {
  return request.tests
    .map((test, index) => {
      const argumentsSource = test.args
        .map((argument, argumentIndex) =>
          toJavaValue(request.parameterTypes[argumentIndex], argument),
        )
        .join(", ");
      return `      case ${index} -> actual = toJson(Solution.${request.entryPoint}(${argumentsSource}));`;
    })
    .join("\n");
}

export function createJavaHarnessSource(request) {
  const testCases = createTestCases(request);
  return `public final class BamJavaHarness {
  private BamJavaHarness() {}

  private static java.lang.String encode(java.lang.String value) {
    return java.util.Base64.getEncoder().encodeToString(
      value.getBytes(java.nio.charset.StandardCharsets.UTF_8)
    );
  }

  private static java.lang.String jsonString(java.lang.String value) {
    if (value == null) return "null";
    java.lang.StringBuilder output = new java.lang.StringBuilder(value.length() + 2);
    output.append('"');
    for (int index = 0; index < value.length(); index += 1) {
      char current = value.charAt(index);
      switch (current) {
        case '"' -> output.append("\\\\\\\"");
        case '\\\\' -> output.append("\\\\\\\\");
        case '\\b' -> output.append("\\\\b");
        case '\\t' -> output.append("\\\\t");
        case '\\n' -> output.append("\\\\n");
        case '\\f' -> output.append("\\\\f");
        case '\\r' -> output.append("\\\\r");
        default -> {
          if (current < 0x20 || java.lang.Character.isSurrogate(current)) {
            output.append(java.lang.String.format("\\\\u%04x", (int) current));
          } else {
            output.append(current);
          }
        }
      }
    }
    return output.append('"').toString();
  }

  private static java.lang.String toJson(int value) {
    return java.lang.Integer.toString(value);
  }

  private static java.lang.String toJson(boolean value) {
    return java.lang.Boolean.toString(value);
  }

  private static java.lang.String toJson(java.lang.String value) {
    return jsonString(value);
  }

  private static java.lang.String toJson(int[] values) {
    if (values == null) return "null";
    java.lang.StringBuilder output = new java.lang.StringBuilder("[");
    for (int index = 0; index < values.length; index += 1) {
      if (index > 0) output.append(',');
      output.append(values[index]);
    }
    return output.append(']').toString();
  }

  private static java.lang.String toJson(java.lang.String[] values) {
    if (values == null) return "null";
    java.lang.StringBuilder output = new java.lang.StringBuilder("[");
    for (int index = 0; index < values.length; index += 1) {
      if (index > 0) output.append(',');
      output.append(jsonString(values[index]));
    }
    return output.append(']').toString();
  }

  public static void main(java.lang.String[] arguments) throws java.lang.Exception {
    int testIndex = java.lang.Integer.parseInt(arguments[0]);
    java.lang.String token;
    try (
      java.io.BufferedReader input = new java.io.BufferedReader(
        new java.io.InputStreamReader(
          java.lang.System.in,
          java.nio.charset.StandardCharsets.UTF_8
        )
      )
    ) {
      token = input.readLine();
    }
    if (token == null || !token.matches("BAM_[a-f0-9]{32}")) {
      throw new java.lang.IllegalArgumentException("invalid harness token");
    }
    try {
      java.lang.String actual;
      switch (testIndex) {
${testCases}
        default -> throw new java.lang.IllegalArgumentException("unknown public test index");
      }
      java.lang.System.out.println(token + "\\tOK\\t" + encode(actual));
    } catch (java.lang.Throwable error) {
      java.lang.String detail =
        error.getClass().getName() + ": " + java.lang.String.valueOf(error.getMessage());
      java.lang.System.out.println(token + "\\tERROR\\t" + encode(detail));
    }
  }
}
`;
}
