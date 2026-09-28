export const javaCodeQuestSolutionFixtures = {
  "quest-java-total-price": {
    "referenceSource": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        long productTotal = (long) price * quantity;\n        return productTotal + shippingFee;\n    }\n}\n",
    "expectedComplexity": {
      "time": "O(1)",
      "space": "O(1)"
    },
    "verificationCases": [
      {
        "id": "verify-java-total-price-zero-price",
        "args": [
          0,
          5,
          1200
        ],
        "expected": "1200"
      },
      {
        "id": "verify-java-total-price-int-boundary",
        "args": [
          214748364,
          10,
          7
        ],
        "expected": "2147483647"
      },
      {
        "id": "verify-java-total-price-above-int-boundary",
        "args": [
          214748364,
          10,
          8
        ],
        "expected": "2147483648"
      },
      {
        "id": "verify-java-total-price-nonround-large",
        "args": [
          1999999999,
          9,
          999999
        ],
        "expected": "18000999990"
      },
      {
        "id": "verify-java-total-price-single-item",
        "args": [
          12345,
          1,
          678
        ],
        "expected": "13023"
      }
    ],
    "representativeWrongSolutions": [
      {
        "id": "int-calculation-before-long-return",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        return price * quantity + shippingFee;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-wide-product",
          "java-total-price-maximum"
        ]
      },
      {
        "id": "cast-after-product",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        return (long) (price * quantity) + shippingFee;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-wide-product",
          "java-total-price-maximum"
        ]
      },
      {
        "id": "long-literal-after-product",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        return price * quantity + 0L + shippingFee;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-wide-product",
          "java-total-price-maximum"
        ]
      },
      {
        "id": "shipping-per-item",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        return ((long) price + shippingFee) * quantity;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-normal",
          "java-total-price-wide-product",
          "java-total-price-maximum",
          "java-total-price-zero-quantity"
        ]
      },
      {
        "id": "zero-quantity-free-shipping",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        if (quantity == 0) {\n            return 0L;\n        }\n        return (long) price * quantity + shippingFee;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-zero-quantity"
        ]
      },
      {
        "id": "missing-shipping",
        "source": "public class Solution {\n    public static long totalPrice(int price, int quantity, int shippingFee) {\n        return (long) price * quantity;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-total-price-normal",
          "java-total-price-wide-product",
          "java-total-price-maximum",
          "java-total-price-zero-quantity"
        ]
      }
    ]
  },
  "quest-java-bridge-arr-01": {
    "referenceSource": "public class Solution {\n    public static int[] solve(int[] readings, int slotNumber, int correctedValue) {\n        // 원본과 결과가 별개여야 하므로 먼저 복사합니다.\n        int[] result = readings.clone();\n        int index = slotNumber - 1;\n        result[index] = correctedValue;\n        return result;\n    }\n}\n",
    "expectedComplexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "verificationCases": [
      {
        "id": "verify-java-bridge-arr-01-last",
        "args": [
          [0,-8,11,23],
          4,
          940
        ],
        "expected": [0,-8,11,940],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      },
      {
        "id": "verify-java-bridge-arr-01-one-change",
        "args": [
          [-1000],
          1,
          1000
        ],
        "expected": [1000],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      },
      {
        "id": "verify-java-bridge-arr-01-same",
        "args": [
          [6,6],
          1,
          6
        ],
        "expected": [6,6],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      }
    ],
    "representativeWrongSolutions": [
      {
        "id": "alias-input",
        "source": "public class Solution {\n    public static int[] solve(int[] readings, int slotNumber, int correctedValue) {\n        int[] result = readings;\n        result[slotNumber - 1] = correctedValue;\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-01-middle",
          "java-bridge-arr-01-first",
          "java-bridge-arr-01-last",
          "java-bridge-arr-01-same-value",
          "java-bridge-arr-01-duplicates",
          "java-bridge-arr-01-maximum"
        ]
      },
      {
        "id": "one-based-index",
        "source": "public class Solution {\n    public static int[] solve(int[] readings, int slotNumber, int correctedValue) {\n        int[] result = readings.clone();\n        if (slotNumber < result.length) {\n            result[slotNumber] = correctedValue;\n        }\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-01-middle",
          "java-bridge-arr-01-first",
          "java-bridge-arr-01-last"
        ]
      },
      {
        "id": "same-value-return-input",
        "source": "public class Solution {\n    public static int[] solve(int[] readings, int slotNumber, int correctedValue) {\n        if (readings[slotNumber - 1] == correctedValue) {\n            return readings;\n        }\n        int[] result = readings.clone();\n        result[slotNumber - 1] = correctedValue;\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-01-same-value"
        ]
      },
      {
        "id": "replace-all-equal",
        "source": "public class Solution {\n    public static int[] solve(int[] readings, int slotNumber, int correctedValue) {\n        int[] result = readings.clone();\n        int oldValue = readings[slotNumber - 1];\n        for (int i = 0; i < result.length; i++) {\n            if (result[i] == oldValue) {\n                result[i] = correctedValue;\n            }\n        }\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-01-duplicates"
        ]
      }
    ]
  },
  "quest-java-bridge-arr-02": {
    "referenceSource": "public class Solution {\n    public static int solve(int[] values, int minimum, int maximum) {\n        int count = 0;\n        for (int value : values) {\n            if (value >= minimum && value <= maximum) {\n                count++;\n            }\n        }\n        return count;\n    }\n}\n",
    "expectedComplexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "verificationCases": [
      {
        "id": "verify-java-bridge-arr-02-full-int",
        "args": [
          [-10000,0,10000],
          -2147483648,
          2147483647
        ],
        "expected": 3
      },
      {
        "id": "verify-java-bridge-arr-02-single",
        "args": [
          [5],
          5,
          5
        ],
        "expected": 1
      },
      {
        "id": "verify-java-bridge-arr-02-negative",
        "args": [
          [-4,-3,-2,2],
          -3,
          2
        ],
        "expected": 3
      }
    ],
    "representativeWrongSolutions": [
      {
        "id": "exclude-boundaries",
        "source": "public class Solution {\n    public static int solve(int[] values, int minimum, int maximum) {\n        int count = 0;\n        for (int value : values) {\n            if (value > minimum && value < maximum) {\n                count++;\n            }\n        }\n        return count;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-02-inclusive",
          "java-bridge-arr-02-equal-bounds",
          "java-bridge-arr-02-maximum"
        ]
      },
      {
        "id": "either-boundary",
        "source": "public class Solution {\n    public static int solve(int[] values, int minimum, int maximum) {\n        int count = 0;\n        for (int value : values) {\n            if (value >= minimum || value <= maximum) {\n                count++;\n            }\n        }\n        return count;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-02-mixed",
          "java-bridge-arr-02-outside",
          "java-bridge-arr-02-equal-bounds"
        ]
      },
      {
        "id": "sum-not-count",
        "source": "public class Solution {\n    public static int solve(int[] values, int minimum, int maximum) {\n        int count = 0;\n        for (int value : values) {\n            if (value >= minimum && value <= maximum) {\n                count += value;\n            }\n        }\n        return count;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-02-mixed",
          "java-bridge-arr-02-maximum"
        ]
      },
      {
        "id": "return-first-match",
        "source": "public class Solution {\n    public static int solve(int[] values, int minimum, int maximum) {\n        int count = 0;\n        for (int value : values) {\n            if (value >= minimum && value <= maximum) {\n                return 1;\n            }\n        }\n        return count;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-arr-02-inclusive",
          "java-bridge-arr-02-maximum"
        ]
      }
    ]
  },
  "quest-java-bridge-que-01": {
    "referenceSource": "import java.util.ArrayDeque;\nimport java.util.Queue;\n\npublic class Solution {\n    public static int[] solve(int[] order) {\n        // 앞에서 꺼내 뒤에 넣는 규칙을 Queue로 표현합니다.\n        Queue<Integer> queue = new ArrayDeque<>(order.length);\n        for (int number : order) {\n            queue.offer(number);\n        }\n        if (!queue.isEmpty()) {\n            int first = queue.poll();\n            queue.offer(first);\n        }\n        int[] result = new int[queue.size()];\n        int index = 0;\n        for (int number : queue) {\n            result[index] = number;\n            index++;\n        }\n        return result;\n    }\n}\n",
    "expectedComplexity": {
      "time": "O(n)",
      "space": "O(n)"
    },
    "verificationCases": [
      {
        "id": "verify-java-bridge-que-01-two",
        "args": [
          [3,9]
        ],
        "expected": [9,3],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      },
      {
        "id": "verify-java-bridge-que-01-mixed",
        "args": [
          [-4,2,0,2,6]
        ],
        "expected": [2,0,2,6,-4],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      },
      {
        "id": "verify-java-bridge-que-01-zero",
        "args": [
          [0]
        ],
        "expected": [0],
        "observations": {
          "argument0Unchanged": true,
          "returnNotArgument0": true
        }
      }
    ],
    "representativeWrongSolutions": [
      {
        "id": "rotate-backwards",
        "source": "public class Solution {\n    public static int[] solve(int[] order) {\n        int[] result = new int[order.length];\n        for (int i = 0; i < order.length; i++) {\n            result[i] = order[(i + order.length - 1) % order.length];\n        }\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-que-01-normal",
          "java-bridge-que-01-value-boundaries",
          "java-bridge-que-01-duplicates"
        ]
      },
      {
        "id": "drop-front",
        "source": "public class Solution {\n    public static int[] solve(int[] order) {\n        if (order.length == 0) {\n            return new int[0];\n        }\n        int[] result = new int[order.length - 1];\n        System.arraycopy(order, 1, result, 0, result.length);\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-que-01-normal",
          "java-bridge-que-01-single"
        ]
      },
      {
        "id": "return-original-small",
        "source": "public class Solution {\n    public static int[] solve(int[] order) {\n        if (order.length <= 1) {\n            return order;\n        }\n        int[] result = new int[order.length];\n        for (int i = 0; i < order.length; i++) {\n            result[i] = order[(i + 1) % order.length];\n        }\n        return result;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-que-01-empty",
          "java-bridge-que-01-single"
        ]
      },
      {
        "id": "mutate-original",
        "source": "public class Solution {\n    public static int[] solve(int[] order) {\n        if (order.length > 0) {\n            int first = order[0];\n            System.arraycopy(order, 1, order, 0, order.length - 1);\n            order[order.length - 1] = first;\n        }\n        return order;\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-que-01-normal",
          "java-bridge-que-01-empty",
          "java-bridge-que-01-single",
          "java-bridge-que-01-value-boundaries",
          "java-bridge-que-01-maximum",
          "java-bridge-que-01-duplicates"
        ]
      },
      {
        "id": "unchanged-copy",
        "source": "public class Solution {\n    public static int[] solve(int[] order) {\n        return order.clone();\n    }\n}\n",
        "expectedFailingPublicTestIds": [
          "java-bridge-que-01-normal",
          "java-bridge-que-01-value-boundaries",
          "java-bridge-que-01-duplicates"
        ]
      }
    ]
  }
};
