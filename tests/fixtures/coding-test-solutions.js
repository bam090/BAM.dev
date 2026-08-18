export const codingTestSolutionFixtures = Object.freeze({
  "coding-test-javascript-target-words": {
    expectedComplexity: { time: "O(n)", space: "O(n)" },
    referenceSource: `function countTargetWords(text, target) {
  const normalizedTarget = target.toLowerCase();
  const trimmedText = text.trim();
  if (trimmedText === "") {
    return 0;
  }
  const words = trimmedText.toLowerCase().split(/\\s+/);
  let count = 0;
  for (const word of words) {
    if (word === normalizedTarget) {
      count += 1;
    }
  }
  return count;
}`,
    verificationCases: [
      {
        id: "verify-words-mixed-whitespace",
        args: ["one\tONE\none", "One"],
        expected: 3,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "substring-counting",
        source: `function countTargetWords(text, target) {
  return text.toLowerCase().split(target.toLowerCase()).length - 1;
}`,
        expectedFailingPublicTestIds: ["words-substring-trap"],
      },
    ],
  },
  "coding-test-javascript-inventory-summary": {
    expectedComplexity: { time: "O(n)", space: "O(1)" },
    referenceSource: `function summarizeInventory(items) {
  const totals = {
    food: 0,
    book: 0,
    tool: 0,
  };
  for (const item of items) {
    totals[item.category] += item.quantity;
  }
  return totals;
}`,
    verificationCases: [
      {
        id: "verify-inventory-all-categories",
        args: [[
          { category: "book", quantity: 8 },
          { category: "food", quantity: 4 },
          { category: "book", quantity: 2 },
          { category: "tool", quantity: 6 },
        ]],
        expected: { food: 4, book: 10, tool: 6 },
      },
    ],
    representativeWrongSolutions: [
      {
        id: "overwrite-category-total",
        source: `function summarizeInventory(items) {
  const totals = { food: 0, book: 0, tool: 0 };
  for (const item of items) {
    totals[item.category] = item.quantity;
  }
  return totals;
}`,
        expectedFailingPublicTestIds: [
          "inventory-duplicate-category",
          "inventory-mixed-duplicates",
          "inventory-maximum-total",
        ],
      },
    ],
  },
  "coding-test-javascript-increasing-run": {
    expectedComplexity: { time: "O(n)", space: "O(1)" },
    referenceSource: `function longestIncreasingRun(values) {
  if (values.length === 0) {
    return 0;
  }
  let currentLength = 1;
  let longestLength = 1;
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] > values[index - 1]) {
      currentLength += 1;
      longestLength = Math.max(longestLength, currentLength);
    } else {
      currentLength = 1;
    }
  }
  return longestLength;
}`,
    verificationCases: [
      {
        id: "verify-run-negative-reset",
        args: [[-5, -3, -1, -4, -2, 0, 2]],
        expected: 4,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "allow-equal-values",
        source: `function longestIncreasingRun(values) {
  if (values.length === 0) return 0;
  let current = 1;
  let longest = 1;
  for (let index = 1; index < values.length; index += 1) {
    current = values[index] >= values[index - 1] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}`,
        expectedFailingPublicTestIds: ["run-equal-breaks"],
      },
    ],
  },
  "coding-test-javascript-product-order": {
    expectedComplexity: { time: "O(n log n)", space: "O(n)" },
    referenceSource: `function sortProductsByPrice(products) {
  const ordered = [...products];
  ordered.sort((left, right) => {
    if (left.price !== right.price) {
      return left.price - right.price;
    }
    if (left.id < right.id) {
      return -1;
    }
    if (left.id > right.id) {
      return 1;
    }
    return 0;
  });
  return ordered.map((product) => product.id);
}`,
    verificationCases: [
      {
        id: "verify-products-three-way-tie",
        args: [[
          { id: "gamma", price: 20 },
          { id: "alpha", price: 20 },
          { id: "cheap", price: 1 },
          { id: "beta", price: 20 },
        ]],
        expected: ["cheap", "alpha", "beta", "gamma"],
      },
    ],
    representativeWrongSolutions: [
      {
        id: "price-only-sort",
        source: `function sortProductsByPrice(products) {
  return [...products]
    .sort((left, right) => left.price - right.price)
    .map((product) => product.id);
}`,
        expectedFailingPublicTestIds: ["products-tied-price", "products-mixed-ties"],
      },
    ],
  },
  "coding-test-javascript-first-position": {
    expectedComplexity: { time: "O(log n)", space: "O(1)" },
    referenceSource: `function findFirstPosition(sortedValues, target) {
  let left = 0;
  let right = sortedValues.length - 1;
  let answer = -1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (sortedValues[middle] >= target) {
      if (sortedValues[middle] === target) {
        answer = middle;
      }
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }
  return answer;
}`,
    verificationCases: [
      {
        id: "verify-search-all-duplicates",
        args: [[4, 4, 4, 4], 4],
        expected: 0,
      },
    ],
    representativeWrongSolutions: [
      {
        id: "return-any-match",
        source: `function findFirstPosition(sortedValues, target) {
  let left = 0;
  let right = sortedValues.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (sortedValues[middle] === target) return middle;
    if (sortedValues[middle] < target) left = middle + 1;
    else right = middle - 1;
  }
  return -1;
}`,
        expectedFailingPublicTestIds: ["search-first-duplicate"],
      },
    ],
  },
  "coding-test-javascript-grid-robot": {
    expectedComplexity: { time: "O(c + o)", space: "O(o)" },
    referenceSource: `function simulateGridRobot(commands, obstacles) {
  const directions = [
    { name: "N", dx: 0, dy: 1 },
    { name: "E", dx: 1, dy: 0 },
    { name: "S", dx: 0, dy: -1 },
    { name: "W", dx: -1, dy: 0 },
  ];
  const blocked = new Set(obstacles.map(([x, y]) => \`\${x},\${y}\`));
  let x = 0;
  let y = 0;
  let directionIndex = 0;
  for (const command of commands) {
    if (command === "L") directionIndex = (directionIndex + 3) % 4;
    else if (command === "R") directionIndex = (directionIndex + 1) % 4;
    else {
      const nextX = x + directions[directionIndex].dx;
      const nextY = y + directions[directionIndex].dy;
      const isInside = nextX >= 0 && nextX <= 4 && nextY >= 0 && nextY <= 4;
      if (isInside && !blocked.has(\`\${nextX},\${nextY}\`)) {
        x = nextX;
        y = nextY;
      }
    }
  }
  return { x, y, direction: directions[directionIndex].name };
}`,
    verificationCases: [
      {
        id: "verify-robot-blocked-after-turn",
        args: [["R", "F", "L", "F", "F"], [[1, 2]]],
        expected: { x: 1, y: 1, direction: "N" },
      },
      {
        id: "verify-robot-south-and-west",
        args: [["F", "F", "R", "F", "R", "F", "F", "R", "F"], []],
        expected: { x: 0, y: 0, direction: "W" },
      },
    ],
    representativeWrongSolutions: [
      {
        id: "ignore-obstacles",
        source: `function simulateGridRobot(commands, obstacles) {
  const directions = [
    { name: "N", dx: 0, dy: 1 },
    { name: "E", dx: 1, dy: 0 },
    { name: "S", dx: 0, dy: -1 },
    { name: "W", dx: -1, dy: 0 },
  ];
  let x = 0;
  let y = 0;
  let directionIndex = 0;
  for (const command of commands) {
    if (command === "L") directionIndex = (directionIndex + 3) % 4;
    else if (command === "R") directionIndex = (directionIndex + 1) % 4;
    else {
      const nextX = x + directions[directionIndex].dx;
      const nextY = y + directions[directionIndex].dy;
      if (nextX >= 0 && nextX <= 4 && nextY >= 0 && nextY <= 4) {
        x = nextX;
        y = nextY;
      }
    }
  }
  return { x, y, direction: directions[directionIndex].name };
}`,
        expectedFailingPublicTestIds: [
          "robot-blocked-at-start",
          "robot-obstacle-after-move",
        ],
      },
      {
        id: "reverse-south-and-west-vectors",
        source: `function simulateGridRobot(commands, obstacles) {
  const directions = [
    { name: "N", dx: 0, dy: 1 },
    { name: "E", dx: 1, dy: 0 },
    { name: "S", dx: 0, dy: 1 },
    { name: "W", dx: 1, dy: 0 },
  ];
  const blocked = new Set(obstacles.map(([x, y]) => \`\${x},\${y}\`));
  let x = 0;
  let y = 0;
  let directionIndex = 0;
  for (const command of commands) {
    if (command === "L") directionIndex = (directionIndex + 3) % 4;
    else if (command === "R") directionIndex = (directionIndex + 1) % 4;
    else {
      const nextX = x + directions[directionIndex].dx;
      const nextY = y + directions[directionIndex].dy;
      if (
        nextX >= 0 && nextX <= 4 && nextY >= 0 && nextY <= 4 &&
        !blocked.has(\`\${nextX},\${nextY}\`)
      ) {
        x = nextX;
        y = nextY;
      }
    }
  }
  return { x, y, direction: directions[directionIndex].name };
}`,
        expectedFailingPublicTestIds: ["robot-move-south", "robot-move-west"],
      },
    ],
  },
});
