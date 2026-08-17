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
        id: "verify-delivery-member-standard-threshold",
        args: [30000, "standard", true],
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
};
