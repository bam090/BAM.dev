export const javaCodeQuestSolutionFixtures = Object.freeze({
  "quest-java-level-label": {
    referenceSource: `public class Solution {
  public static String formatLevelLabel(String name, int level) {
    String levelText = "Lv." + level;
    return name + " · " + levelText;
  }
}`,
    expectedComplexity: {
      time: "O(n), n = name의 길이",
      space: "O(n), n = 반환 문자열의 길이",
    },
    verificationCases: [
      {
        id: "verify-java-level-middle",
        args: ["Lee", 50],
        expected: "Lee · Lv.50",
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-omit-zero-level",
        source: `public class Solution {
  public static String formatLevelLabel(String name, int level) {
    if (level == 0) {
      return name;
    }
    return name + " · Lv." + level;
  }
}`,
        expectedFailingPublicTestIds: ["java-level-zero"],
      },
    ],
    boundaryCoverage: {
      normal: ["java-level-example", "verify-java-level-middle"],
      minimum: ["java-level-zero"],
      maximum: ["java-level-maximum"],
      edge: ["java-level-empty-name"],
    },
  },
  "quest-java-count-at-least": {
    referenceSource: `public class Solution {
  public static int countAtLeast(int[] scores, int minimum) {
    int count = 0;
    for (int score : scores) {
      if (score >= minimum) {
        count += 1;
      }
    }
    return count;
  }
}`,
    expectedComplexity: {
      time: "O(n), n = scores의 길이",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-at-least-extremes",
        args: [[1000, -1000, 0, 999], 0],
        expected: 3,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-strict-threshold",
        source: `public class Solution {
  public static int countAtLeast(int[] scores, int minimum) {
    int count = 0;
    for (int score : scores) {
      if (score > minimum) {
        count += 1;
      }
    }
    return count;
  }
}`,
        expectedFailingPublicTestIds: [
          "java-at-least-equal-boundary",
          "java-at-least-mixed",
          "java-at-least-all",
          "java-at-least-negative-threshold",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["java-at-least-mixed"],
      minimum: ["java-at-least-empty"],
      maximum: ["verify-java-at-least-extremes"],
      edge: ["java-at-least-equal-boundary", "java-at-least-negative-threshold"],
    },
  },
  "quest-java-remaining-seats": {
    referenceSource: `public class Solution {
  private static class SeatCounter {
    private int capacity;
    private int reserved;

    SeatCounter(int capacity, int reserved) {
      this.capacity = capacity;
      this.reserved = reserved;
    }

    int remaining() {
      return capacity - reserved;
    }
  }

  public static int calculateRemainingSeats(int capacity, int reserved) {
    SeatCounter counter = new SeatCounter(capacity, reserved);
    return counter.remaining();
  }
}`,
    expectedComplexity: {
      time: "O(1)",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-seats-large-partial",
        args: [9999, 1234],
        expected: 8765,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-shadowed-constructor-fields",
        source: `public class Solution {
  private static class SeatCounter {
    private int capacity;
    private int reserved;

    SeatCounter(int capacity, int reserved) {
      capacity = capacity;
      reserved = reserved;
    }

    int remaining() {
      return capacity - reserved;
    }
  }

  public static int calculateRemainingSeats(int capacity, int reserved) {
    SeatCounter counter = new SeatCounter(capacity, reserved);
    return counter.remaining();
  }
}`,
        expectedFailingPublicTestIds: [
          "java-seats-none-reserved",
          "java-seats-partial",
          "java-seats-single-open",
          "java-seats-maximum",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["java-seats-partial", "verify-java-seats-large-partial"],
      minimum: ["java-seats-single-open"],
      maximum: ["java-seats-maximum"],
      edge: ["java-seats-none-reserved", "java-seats-full"],
    },
  },
  "quest-java-distinct-names": {
    referenceSource: `import java.util.ArrayList;
import java.util.List;

public class Solution {
  public static String[] distinctNames(String[] names) {
    List<String> result = new ArrayList<>();
    for (String name : names) {
      if (!result.contains(name)) {
        result.add(name);
      }
    }
    return result.toArray(new String[0]);
  }
}`,
    expectedComplexity: {
      time: "O(n² + n·c) 최악, n = names의 길이, c = 모든 이름 길이의 합 (List.contains의 선형 탐색과 String 비교 비용 포함)",
      space: "O(n) 추가 공간, n = names의 길이",
    },
    verificationCases: [
      {
        id: "verify-java-names-first-order",
        args: [["b", "b", "a", "c", "a"]],
        expected: ["b", "a", "c"],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-sort-instead-of-preserve",
        source: `import java.util.ArrayList;
import java.util.List;

public class Solution {
  public static String[] distinctNames(String[] names) {
    List<String> result = new ArrayList<>();
    for (String name : names) {
      if (!result.contains(name)) {
        result.add(name);
      }
    }
    result.sort(String::compareTo);
    return result.toArray(new String[0]);
  }
}`,
        expectedFailingPublicTestIds: [
          "java-names-separated-repeat",
          "java-names-case-sensitive",
          "java-names-many-repeats",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["java-names-separated-repeat", "verify-java-names-first-order"],
      minimum: ["java-names-empty"],
      maximum: ["java-names-many-repeats"],
      edge: ["java-names-case-sensitive", "java-names-consecutive-duplicate"],
    },
  },
  "quest-java-parse-fallback": {
    referenceSource: `public class Solution {
  public static int parseOrFallback(String value, int fallback) {
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException error) {
      return fallback;
    }
  }
}`,
    expectedComplexity: {
      time: "O(n), n = value의 길이",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-parse-int-minimum",
        args: ["-2147483648", 1],
        expected: -2147483648,
      },
      {
        id: "verify-java-parse-int-maximum",
        args: ["2147483647", 1],
        expected: 2147483647,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-reject-signed-integers",
        source: `public class Solution {
  public static int parseOrFallback(String value, int fallback) {
    try {
      if (!value.matches("\\\\d+")) {
        return fallback;
      }
      return Integer.parseInt(value);
    } catch (NumberFormatException error) {
      return fallback;
    }
  }
}`,
        expectedFailingPublicTestIds: ["java-parse-negative", "java-parse-plus-sign"],
      },
    ],
    boundaryCoverage: {
      normal: ["java-parse-positive"],
      minimum: ["verify-java-parse-int-minimum"],
      maximum: ["verify-java-parse-int-maximum"],
      edge: ["java-parse-empty", "java-parse-invalid-character", "java-parse-overflow"],
    },
  },
});
