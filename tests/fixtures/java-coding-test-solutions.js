export const javaCodingTestSolutionFixtures = Object.freeze({
  "coding-test-java-count-vowels": {
    referenceSource: `public class Solution {
  public static int countVowels(String text) {
    int count = 0;
    for (int index = 0; index < text.length(); index += 1) {
      char letter = text.charAt(index);
      if (letter == 'a' || letter == 'e' || letter == 'i'
          || letter == 'o' || letter == 'u'
          || letter == 'A' || letter == 'E' || letter == 'I'
          || letter == 'O' || letter == 'U') {
        count += 1;
      }
    }
    return count;
  }
}`,
    expectedComplexity: {
      time: "O(n), n = text의 길이",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-vowels-korean-and-ascii",
        args: ["OpenAI와 CODE"],
        expected: 6,
      },
      {
        id: "verify-java-vowels-non-ascii-capital-i",
        args: ["İ"],
        expected: 0,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-lowercase-vowels-only",
        source: `public class Solution {
  public static int countVowels(String text) {
    int count = 0;
    for (int index = 0; index < text.length(); index += 1) {
      if ("aeiou".indexOf(text.charAt(index)) >= 0) {
        count += 1;
      }
    }
    return count;
  }
}`,
        expectedFailingPublicTestIds: [
          "java-vowels-uppercase",
          "java-vowels-mixed-case",
          "java-vowels-repeated",
        ],
      },
    ],
  },
  "coding-test-java-merge-alternating": {
    referenceSource: `public class Solution {
  public static int[] mergeAlternating(int[] left, int[] right) {
    int[] merged = new int[left.length + right.length];
    int writeIndex = 0;
    int maximumLength = Math.max(left.length, right.length);
    for (int index = 0; index < maximumLength; index += 1) {
      if (index < left.length) {
        merged[writeIndex++] = left[index];
      }
      if (index < right.length) {
        merged[writeIndex++] = right[index];
      }
    }
    return merged;
  }
}`,
    expectedComplexity: {
      time: "O(n + m), n = left의 길이, m = right의 길이",
      space: "O(n + m)",
    },
    verificationCases: [
      {
        id: "verify-java-merge-negative-imbalanced",
        args: [[-1, -2], [5, 6, 7, 8]],
        expected: [-1, 5, -2, 6, 7, 8],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-stop-at-shorter-array",
        source: `public class Solution {
  public static int[] mergeAlternating(int[] left, int[] right) {
    int pairCount = Math.min(left.length, right.length);
    int[] merged = new int[pairCount * 2];
    for (int index = 0; index < pairCount; index += 1) {
      merged[index * 2] = left[index];
      merged[index * 2 + 1] = right[index];
    }
    return merged;
  }
}`,
        expectedFailingPublicTestIds: [
          "java-merge-left-longer",
          "java-merge-right-longer",
          "java-merge-left-empty",
          "java-merge-right-empty",
        ],
      },
    ],
  },
  "coding-test-java-classify-students": {
    referenceSource: `public class Solution {
  private static class StudentResult {
    private final String name;
    private final int score;

    StudentResult(String name, int score) {
      this.name = name;
      this.score = score;
    }

    String label() {
      return name + (score >= 60 ? ":PASS" : ":RETRY");
    }
  }

  public static String[] classifyStudents(String[] names, int[] scores) {
    String[] labels = new String[names.length];
    for (int index = 0; index < names.length; index += 1) {
      StudentResult student = new StudentResult(names[index], scores[index]);
      labels[index] = student.label();
    }
    return labels;
  }
}`,
    expectedComplexity: {
      time: "O(n + c), n = names의 길이, c = 모든 이름 길이의 합",
      space: "O(n + c), n = 반환 항목 수, c = 결과에 복사되는 이름 길이의 합",
    },
    verificationCases: [
      {
        id: "verify-java-students-two-boundaries",
        args: [["Neo", "Una"], [60, 0]],
        expected: ["Neo:PASS", "Una:RETRY"],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-pass-above-sixty-only",
        source: `public class Solution {
  private static class StudentResult {
    private final String name;
    private final int score;

    StudentResult(String name, int score) {
      this.name = name;
      this.score = score;
    }

    String label() {
      return name + (score > 60 ? ":PASS" : ":RETRY");
    }
  }

  public static String[] classifyStudents(String[] names, int[] scores) {
    String[] labels = new String[names.length];
    for (int index = 0; index < names.length; index += 1) {
      labels[index] = new StudentResult(names[index], scores[index]).label();
    }
    return labels;
  }
}`,
        expectedFailingPublicTestIds: [
          "java-students-boundary",
          "java-students-mixed",
          "java-students-repeated-name",
        ],
      },
    ],
  },
  "coding-test-java-frequency-report": {
    referenceSource: `import java.util.LinkedHashMap;
import java.util.Map;

public class Solution {
  public static String[] frequencyReport(String[] words) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
      counts.put(word, counts.getOrDefault(word, 0) + 1);
    }
    String[] report = new String[counts.size()];
    int index = 0;
    for (Map.Entry<String, Integer> entry : counts.entrySet()) {
      report[index++] = entry.getKey() + "=" + entry.getValue();
    }
    return report;
  }
}`,
    expectedComplexity: {
      time: "O(n + c + u log(n + 1)) 평균, n = words의 길이, c = 모든 단어 길이의 합, u = 고유 단어 수 (LinkedHashMap 연산 평균 O(1) 가정)",
      space: "O(u + c + u log(n + 1)), c = 모든 단어 길이의 합, u = 고유 단어 수",
    },
    verificationCases: [
      {
        id: "verify-java-frequency-order-and-count",
        args: [["b", "a", "b", "c", "a", "b"]],
        expected: ["b=3", "a=2", "c=1"],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-case-insensitive-frequency",
        source: `import java.util.LinkedHashMap;
import java.util.Map;

public class Solution {
  public static String[] frequencyReport(String[] words) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String word : words) {
      String key = word.toLowerCase();
      counts.put(key, counts.getOrDefault(key, 0) + 1);
    }
    String[] report = new String[counts.size()];
    int index = 0;
    for (Map.Entry<String, Integer> entry : counts.entrySet()) {
      report[index++] = entry.getKey() + "=" + entry.getValue();
    }
    return report;
  }
}`,
        expectedFailingPublicTestIds: ["java-frequency-case-sensitive"],
      },
    ],
  },
  "coding-test-java-sum-valid-integers": {
    referenceSource: `public class Solution {
  public static int sumValidIntegers(String[] tokens) {
    int total = 0;
    for (String token : tokens) {
      try {
        total += Integer.parseInt(token);
      } catch (NumberFormatException error) {
        // 변환할 수 없는 현재 항목만 건너뜁니다.
      }
    }
    return total;
  }
}`,
    expectedComplexity: {
      time: "O(c), c = 모든 문자열 길이의 합",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-sum-int-boundaries",
        args: [["-2147483648", "2147483647", "1", "bad"]],
        expected: 0,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-ignore-negative-integers",
        source: `public class Solution {
  public static int sumValidIntegers(String[] tokens) {
    int total = 0;
    for (String token : tokens) {
      try {
        int value = Integer.parseInt(token);
        if (value >= 0) {
          total += value;
        }
      } catch (NumberFormatException error) {
        // 변환할 수 없는 현재 항목만 건너뜁니다.
      }
    }
    return total;
  }
}`,
        expectedFailingPublicTestIds: ["java-sum-negative", "java-sum-invalid-between"],
      },
    ],
  },
  "coding-test-java-maximum-window-sum": {
    referenceSource: `public class Solution {
  public static int maximumWindowSum(int[] values, int windowSize) {
    int windowSum = 0;
    for (int index = 0; index < windowSize; index += 1) {
      windowSum += values[index];
    }
    int maximum = windowSum;
    for (int end = windowSize; end < values.length; end += 1) {
      windowSum += values[end];
      windowSum -= values[end - windowSize];
      if (windowSum > maximum) {
        maximum = windowSum;
      }
    }
    return maximum;
  }
}`,
    expectedComplexity: {
      time: "O(n), n = values의 길이",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-java-window-late-maximum",
        args: [[5, -1, 5, -10, 9, 9], 2],
        expected: 18,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "java-zero-initial-window-maximum",
        source: `public class Solution {
  public static int maximumWindowSum(int[] values, int windowSize) {
    int windowSum = 0;
    for (int index = 0; index < windowSize; index += 1) {
      windowSum += values[index];
    }
    int maximum = 0;
    for (int end = windowSize; end < values.length; end += 1) {
      maximum = Math.max(maximum, windowSum);
      windowSum += values[end] - values[end - windowSize];
    }
    return Math.max(maximum, windowSum);
  }
}`,
        expectedFailingPublicTestIds: [
          "java-window-all-negative",
          "java-window-single-negative",
        ],
      },
    ],
  },
});
