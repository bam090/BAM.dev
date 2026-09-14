export const codeQuestSolutionFixtures = {
  "quest-javascript-delivery-fee": {
    referenceSource: `function calculateDeliveryFee(orderTotal, destination, hasMembership) {
  const standardFee = 3000;
  const islandSurcharge = 5000;
  const freeThreshold = hasMembership ? 30000 : 50000;
  let fee = standardFee;

  if (orderTotal >= freeThreshold) {
    fee = 0;
  }
  if (destination === "island") {
    fee += islandSurcharge;
  }
  return fee;
}`,
    expectedComplexity: {
      time: "O(1)",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-delivery-standard-normal",
        args: [20000, "standard", false],
        expected: 3000,
      },
      {
        id: "verify-delivery-regular-standard-above-threshold",
        args: [50001, "standard", false],
        expected: 0,
      },
      {
        id: "verify-delivery-member-island-below-threshold",
        args: [29999, "island", true],
        expected: 8000,
      },
      {
        id: "verify-delivery-maximum-member-island",
        args: [1000000, "island", true],
        expected: 5000,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "combined-fee-condition",
        source: `function calculateDeliveryFee(orderTotal, destination, hasMembership) {
  if (hasMembership || orderTotal >= 50000) {
    return 0;
  }
  return destination === "island" ? 8000 : 3000;
}`,
        expectedFailingPublicTestIds: [
          "delivery-member-below-threshold",
          "delivery-member-at-threshold",
          "delivery-regular-at-threshold-island",
        ],
      },
      {
        id: "membership-threshold-by-destination",
        source: `function calculateDeliveryFee(orderTotal, destination, hasMembership) {
  const freeThreshold = destination === "island" ? 30000 : 50000;
  let fee = orderTotal >= freeThreshold ? 0 : 3000;
  if (destination === "island") {
    fee += 5000;
  }
  return fee;
}`,
        expectedFailingPublicTestIds: ["delivery-member-standard-at-threshold"],
      },
    ],
    boundaryCoverage: {
      normal: ["delivery-standard-paid"],
      minimum: ["delivery-minimum-island"],
      maximum: ["verify-delivery-maximum-member-island"],
      edge: [
        "delivery-member-below-threshold",
        "delivery-member-at-threshold",
        "delivery-regular-at-threshold-island",
      ],
    },
  },
  "quest-javascript-number-path": {
    referenceSource: `function buildNumberPath(start, end, step) {
  const path = [];

  if (start <= end) {
    for (let current = start; current <= end; current += step) {
      path.push(current);
    }
  } else {
    for (let current = start; current >= end; current -= step) {
      path.push(current);
    }
  }

  return path;
}`,
    expectedComplexity: {
      time: "O(d / step + 1), d = |start - end|",
      space: "O(d / step + 1), d = |start - end|",
    },
    verificationCases: [
      {
        id: "verify-path-minimum-step",
        args: [-2, 2, 1],
        expected: [-2, -1, 0, 1, 2],
      },
      {
        id: "verify-path-full-range-descending",
        args: [100, -100, 20],
        expected: [100, 80, 60, 40, 20, 0, -20, -40, -60, -80, -100],
      },
      {
        id: "verify-path-step-over-distance-ascending",
        args: [-3, 3, 10],
        expected: [-3],
      },
      {
        id: "verify-path-step-over-distance-descending",
        args: [3, -3, 10],
        expected: [3],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "ascending-only-loop",
        source: `function buildNumberPath(start, end, step) {
  const path = [];
  for (let current = start; current < end; current += step) {
    path.push(current);
  }
  return path;
}`,
        expectedFailingPublicTestIds: [
          "path-same-point",
          "path-ascending-exact",
          "path-descending-exact",
          "path-descending-before-overrun",
          "path-full-range-maximum-step",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["path-ascending-before-overrun", "path-descending-before-overrun"],
      minimum: ["verify-path-minimum-step"],
      maximum: ["path-full-range-maximum-step"],
      edge: ["path-same-point", "path-ascending-exact", "path-descending-exact"],
    },
  },
  "quest-javascript-median": {
    referenceSource: `function calculateMedian(values) {
  const sortedValues = [...values];
  sortedValues.sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedValues.length / 2);
  const hasOddLength = sortedValues.length % 2 === 1;

  if (hasOddLength) {
    return sortedValues[middleIndex];
  }

  const leftMiddle = sortedValues[middleIndex - 1];
  const rightMiddle = sortedValues[middleIndex];
  return (leftMiddle + rightMiddle) / 2;
}`,
    expectedComplexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
    verificationCases: [
      {
        id: "verify-median-zero",
        args: [[0]],
        expected: 0,
      },
      {
        id: "verify-median-negative-odd",
        args: [[-5, -1, -3]],
        expected: -3,
      },
      {
        id: "verify-median-two-values",
        args: [[1, 2]],
        expected: 1.5,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "lexicographic-number-sort",
        source: `function calculateMedian(values) {
  const sortedValues = [...values].sort();
  const middleIndex = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 1) {
    return sortedValues[middleIndex];
  }
  return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
}`,
        expectedFailingPublicTestIds: [
          "median-numeric-sort-trap",
          "median-maximum-length",
        ],
      },
      {
        id: "drop-duplicate-values",
        source: `function calculateMedian(values) {
  const sortedValues = [...new Set(values)].sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 1) {
    return sortedValues[middleIndex];
  }
  return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
}`,
        expectedFailingPublicTestIds: ["median-extreme-duplicates"],
      },
    ],
    boundaryCoverage: {
      normal: ["median-odd-unsorted", "median-even-unsorted"],
      minimum: ["median-single-minimum"],
      maximum: ["median-extreme-duplicates", "median-maximum-length"],
      edge: ["median-numeric-sort-trap", "median-extreme-duplicates"],
    },
  },
  "quest-javascript-compress-signals": {
    referenceSource: `function compressSignals(signals) {
  const compressed = [];

  for (const signal of signals) {
    if (compressed.length === 0) {
      compressed.push(signal);
      continue;
    }

    const previousSignal = compressed[compressed.length - 1];
    if (signal !== previousSignal) {
      compressed.push(signal);
    }
  }

  return compressed;
}`,
    expectedComplexity: {
      time: "O(n)",
      space: "O(n)",
    },
    verificationCases: [
      {
        id: "verify-signals-yellow-transitions",
        args: [["yellow", "red", "red", "yellow", "green", "green"]],
        expected: ["yellow", "red", "yellow", "green"],
      },
      {
        id: "verify-signals-leading-and-trailing-runs",
        args: [["green", "green", "red", "green", "green"]],
        expected: ["green", "red", "green"],
      },
      {
        id: "verify-signals-three-kinds",
        args: [["red", "yellow", "green"]],
        expected: ["red", "yellow", "green"],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "remove-all-duplicates",
        source: `function compressSignals(signals) {
  return [...new Set(signals)];
}`,
        expectedFailingPublicTestIds: [
          "signals-separated-repeat",
          "signals-maximum-alternating",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["signals-consecutive-run", "signals-separated-repeat"],
      minimum: ["signals-empty"],
      maximum: ["signals-maximum-alternating"],
      edge: ["signals-single", "signals-all-same"],
    },
  },
  "quest-javascript-next-task": {
    referenceSource: `function selectNextTask(tasks) {
  let selectedTask = null;

  for (const task of tasks) {
    if (task.completed) {
      continue;
    }
    if (selectedTask === null || task.priority < selectedTask.priority) {
      selectedTask = task;
    }
  }

  if (selectedTask === null) {
    return null;
  }
  return selectedTask.id;
}`,
    expectedComplexity: {
      time: "O(n)",
      space: "O(1)",
    },
    verificationCases: [
      {
        id: "verify-tasks-priority-boundaries",
        args: [[
          { id: "low", priority: 5, completed: false },
          { id: "high", priority: 1, completed: false },
        ]],
        expected: "high",
      },
      {
        id: "verify-tasks-first-tie-wins",
        args: [[
          { id: "first", priority: 2, completed: false },
          { id: "second", priority: 2, completed: false },
        ]],
        expected: "first",
      },
      {
        id: "verify-tasks-completed-between-candidates",
        args: [[
          { id: "candidate", priority: 3, completed: false },
          { id: "done", priority: 1, completed: true },
          { id: "winner", priority: 2, completed: false },
        ]],
        expected: "winner",
      },
    ],
    representativeWrongSolutions: [
      {
        id: "first-pending-task",
        source: `function selectNextTask(tasks) {
  for (const task of tasks) {
    if (!task.completed) {
      return task.id;
    }
  }
  return null;
}`,
        expectedFailingPublicTestIds: [
          "tasks-lower-priority-number-wins",
          "tasks-maximum-count-tie",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["tasks-single-pending", "tasks-lower-priority-number-wins"],
      minimum: ["tasks-empty"],
      maximum: ["tasks-maximum-count-tie"],
      edge: ["tasks-all-completed", "tasks-ignore-completed-priority"],
    },
  },
  "quest-javascript-registered-code-check": {
    referenceSource: `function markRegisteredCodes(registeredCodes, scannedCodes) {
  const registered = new Set();
  const results = [];

  for (const code of registeredCodes) {
    registered.add(code);
  }

  for (const code of scannedCodes) {
    const isRegistered = registered.has(code);
    results.push(isRegistered);
  }

  return results;
}`,
    expectedComplexity: {
      time: "O(r + s) expected",
      space: "O(r + s)",
    },
    verificationCases: [
      {
        id: "verify-registered-exact-code",
        args: [["gate-1"], ["gate-10", "gate-1"]],
        expected: [false, true],
      },
      {
        id: "verify-registered-last-match",
        args: [["gate-a", "gate-z"], ["gate-x", "gate-z"]],
        expected: [false, true],
      },
      {
        id: "verify-registered-maximum-lengths",
        args: [
          Array.from({ length: 30 }, (_, index) => `gate-${index + 1}`),
          Array.from({ length: 30 }, (_, index) =>
            index % 2 === 0 ? `gate-${index + 1}` : `missing-${index + 1}`,
          ),
        ],
        expected: Array.from({ length: 30 }, (_, index) => index % 2 === 0),
      },
    ],
    representativeWrongSolutions: [
      {
        id: "registered-scan-set-as-reference",
        source: `function markRegisteredCodes(registeredCodes, scannedCodes) {
  const registered = new Set(scannedCodes);
  return registeredCodes.map((code) => registered.has(code));
}`,
        expectedFailingPublicTestIds: [
          "hash-registered-no-reference",
          "hash-registered-no-scans",
          "hash-registered-mixed",
          "hash-registered-repeated-scan",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["hash-registered-mixed"],
      minimum: ["hash-registered-both-empty", "hash-registered-no-reference"],
      maximum: ["verify-registered-maximum-lengths"],
      edge: ["hash-registered-repeated-scan", "verify-registered-exact-code"],
    },
  },
  "quest-javascript-locker-lookup": {
    referenceSource: `function resolveLockerNumbers(assignments, studentIds) {
  const lockerByStudent = new Map();
  const results = [];

  for (const assignment of assignments) {
    lockerByStudent.set(assignment.studentId, assignment.lockerNumber);
  }

  for (const studentId of studentIds) {
    if (lockerByStudent.has(studentId)) {
      results.push(lockerByStudent.get(studentId));
    } else {
      results.push(null);
    }
  }

  return results;
}`,
    expectedComplexity: {
      time: "O(a + q) expected",
      space: "O(a + q)",
    },
    verificationCases: [
      {
        id: "verify-locker-maximum-number",
        args: [[{ studentId: "student-max", lockerNumber: 999 }], ["student-max"]],
        expected: [999],
      },
      {
        id: "verify-locker-last-assignment-and-missing",
        args: [[
          { studentId: "student-a", lockerNumber: 41 },
          { studentId: "student-z", lockerNumber: 82 },
        ], ["student-z", "student-x"]],
        expected: [82, null],
      },
      {
        id: "verify-locker-maximum-lengths",
        args: [
          Array.from({ length: 30 }, (_, index) => ({
            studentId: `student-${index + 1}`,
            lockerNumber: index,
          })),
          Array.from({ length: 30 }, (_, index) => `student-${30 - index}`),
        ],
        expected: Array.from({ length: 30 }, (_, index) => 29 - index),
      },
    ],
    representativeWrongSolutions: [
      {
        id: "locker-falsy-value-as-missing",
        source: `function resolveLockerNumbers(assignments, studentIds) {
  const lockerByStudent = new Map();
  for (const assignment of assignments) {
    lockerByStudent.set(assignment.studentId, assignment.lockerNumber);
  }
  return studentIds.map((studentId) => lockerByStudent.get(studentId) || null);
}`,
        expectedFailingPublicTestIds: ["hash-locker-zero-number"],
      },
    ],
    boundaryCoverage: {
      normal: ["hash-locker-mixed", "hash-locker-query-order"],
      minimum: ["hash-locker-both-empty", "hash-locker-zero-number"],
      maximum: ["verify-locker-maximum-number", "verify-locker-maximum-lengths"],
      edge: ["hash-locker-no-assignments", "hash-locker-repeated-query"],
    },
  },
  "quest-javascript-first-code-at-count": {
    referenceSource: `function findFirstCodeAtCount(codes, requiredCount) {
  const counts = new Map();

  for (const code of codes) {
    const previousCount = counts.has(code) ? counts.get(code) : 0;
    const nextCount = previousCount + 1;
    counts.set(code, nextCount);

    if (nextCount === requiredCount) {
      return code;
    }
  }

  return null;
}`,
    expectedComplexity: {
      time: "O(n) expected",
      space: "O(u), u = distinct codes",
    },
    verificationCases: [
      {
        id: "verify-count-maximum-length-last-reach",
        args: [[
          ...Array.from({ length: 49 }, (_, index) => `unique-${index + 1}`),
          "unique-1",
        ], 2],
        expected: "unique-1",
      },
      {
        id: "verify-count-maximum-required-count",
        args: [Array.from({ length: 50 }, () => "same-code"), 50],
        expected: "same-code",
      },
      {
        id: "verify-count-interleaved-second-code-wins",
        args: [["code-a", "code-b", "code-c", "code-b", "code-a"], 2],
        expected: "code-b",
      },
    ],
    representativeWrongSolutions: [
      {
        id: "count-after-full-scan",
        source: `function findFirstCodeAtCount(codes, requiredCount) {
  const counts = new Map();
  for (const code of codes) {
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  for (const code of codes) {
    if (counts.get(code) >= requiredCount) {
      return code;
    }
  }
  return null;
}`,
        expectedFailingPublicTestIds: ["hash-count-arrival-order"],
      },
    ],
    boundaryCoverage: {
      normal: ["hash-count-repeated-first", "verify-count-interleaved-second-code-wins"],
      minimum: ["hash-count-empty", "hash-count-threshold-one"],
      maximum: [
        "verify-count-maximum-length-last-reach",
        "verify-count-maximum-required-count",
      ],
      edge: ["hash-count-no-reach", "hash-count-last-position", "hash-count-arrival-order"],
    },
  },
  "quest-javascript-unfilled-requests": {
    referenceSource: `function findUnfilledRequests(availableCodes, requestedCodes) {
  const remainingByCode = new Map();
  const unfilled = [];

  for (const code of availableCodes) {
    const previousCount = remainingByCode.has(code) ? remainingByCode.get(code) : 0;
    remainingByCode.set(code, previousCount + 1);
  }

  for (const code of requestedCodes) {
    const remaining = remainingByCode.has(code) ? remainingByCode.get(code) : 0;
    if (remaining > 0) {
      remainingByCode.set(code, remaining - 1);
      continue;
    }
    unfilled.push(code);
  }

  return unfilled;
}`,
    expectedComplexity: {
      time: "O(a + r) expected",
      space: "O(u + r), u = distinct available codes",
    },
    verificationCases: [
      {
        id: "verify-unfilled-repeated-shortages",
        args: [["code-a", "code-b"], ["code-a", "code-c", "code-b", "code-c"]],
        expected: ["code-c", "code-c"],
      },
      {
        id: "verify-unfilled-maximum-requests",
        args: [
          Array.from({ length: 25 }, () => "pass"),
          Array.from({ length: 50 }, () => "pass"),
        ],
        expected: Array.from({ length: 25 }, () => "pass"),
      },
      {
        id: "verify-unfilled-maximum-stock-without-requests",
        args: [Array.from({ length: 50 }, (_, index) => `stock-${index + 1}`), []],
        expected: [],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "unfilled-presence-without-quantity",
        source: `function findUnfilledRequests(availableCodes, requestedCodes) {
  const available = new Set(availableCodes);
  return requestedCodes.filter((code) => !available.has(code));
}`,
        expectedFailingPublicTestIds: [
          "hash-unfilled-one-short",
          "hash-unfilled-mixed-order",
        ],
      },
    ],
    boundaryCoverage: {
      normal: ["hash-unfilled-mixed-order", "hash-unfilled-extra-stock"],
      minimum: ["hash-unfilled-both-empty", "hash-unfilled-no-stock"],
      maximum: [
        "verify-unfilled-maximum-requests",
        "verify-unfilled-maximum-stock-without-requests",
      ],
      edge: ["hash-unfilled-exact-duplicates", "hash-unfilled-one-short"],
    },
  },
};
