import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateSchemaValue } from "../scripts/validate-content.mjs";
import {
  assertValidWebProjectCollection,
  findWebProjectSourceIssue,
  validateWebProjectCollection,
} from "../src/core/web-project.js";
import {
  findWebCodeQuestSourceIssue,
  getWebAssertionExpected,
} from "../src/core/web-code-quest.js";
import {
  evaluateCssStyleAssertion,
  evaluateHtmlDomAssertion,
} from "../src/grading/browser-web-code-quest-runner.js";
import { webProjectSolutionFixtures } from "./fixtures/web-project-solutions.js";

const collection = JSON.parse(
  await readFile(new URL("../content/web-projects/index.json", import.meta.url), "utf8"),
);
const curriculum = JSON.parse(
  await readFile(new URL("../content/curriculum.json", import.meta.url), "utf8"),
);
const schema = JSON.parse(
  await readFile(new URL("../content/schema/web-project.schema.json", import.meta.url), "utf8"),
);

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function getSchemaErrors(value) {
  const errors = [];
  validateSchemaValue(value, schema, schema, "$", errors);
  return errors;
}

function parseAttributes(source) {
  const attributes = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  for (const match of source.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function parseHtmlFragment(source) {
  const root = { tagName: null, parent: null, children: [] };
  const stack = [root];
  const tokens = source.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+|</gu) ?? [];
  for (const token of tokens) {
    if (token.startsWith("<!--") || /^<!/u.test(token)) continue;
    if (!token.startsWith("<")) {
      stack.at(-1).children.push(token);
      continue;
    }
    if (/^<\s*\//u.test(token)) {
      const closingName = /^<\s*\/\s*([A-Za-z][A-Za-z0-9-]*)/u.exec(token)?.[1]?.toLowerCase();
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tagName === closingName) {
          stack.length = index;
          break;
        }
      }
      continue;
    }
    const opening = /^<\s*([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)(\/?)>$/u.exec(token);
    assert.ok(opening, `테스트 HTML 파서가 해석할 수 없는 태그입니다: ${token}`);
    const tagName = opening[1].toLowerCase();
    const node = {
      tagName,
      parent: stack.at(-1),
      children: [],
      attributes: parseAttributes(opening[2]),
      getAttribute(name) {
        return this.attributes.has(name.toLowerCase())
          ? this.attributes.get(name.toLowerCase())
          : null;
      },
      get textContent() {
        return this.children
          .map((child) => (typeof child === "string" ? child : child.textContent))
          .join("");
      },
    };
    stack.at(-1).children.push(node);
    if (!opening[3] && !VOID_ELEMENTS.has(tagName)) stack.push(node);
  }
  return root;
}

function collectElements(root) {
  const elements = [];
  const visit = (node) => {
    for (const child of node.children) {
      if (typeof child === "string") continue;
      elements.push(child);
      visit(child);
    }
  };
  visit(root);
  return elements;
}

function extractDirectChildHasSelectors(selector) {
  const childSelectors = [];
  let baseSelector = "";
  let cursor = 0;
  while (cursor < selector.length) {
    const start = selector.indexOf(":has(", cursor);
    if (start < 0) {
      baseSelector += selector.slice(cursor);
      break;
    }
    baseSelector += selector.slice(cursor, start);
    let depth = 1;
    let end = start + 5;
    while (end < selector.length && depth > 0) {
      if (selector[end] === "(") depth += 1;
      if (selector[end] === ")") depth -= 1;
      end += 1;
    }
    assert.equal(depth, 0, `테스트 DOM이 지원하지 않는 :has 선택자입니다: ${selector}`);
    const argument = selector.slice(start + 5, end - 1).trim();
    childSelectors.push(argument.replace(/^>\s*/u, ""));
    cursor = end;
  }
  return { baseSelector, childSelectors };
}

function matchesSimpleSelector(element, selector) {
  const { baseSelector, childSelectors } = extractDirectChildHasSelectors(selector);
  const tagName = /^[A-Za-z][A-Za-z0-9-]*/u.exec(baseSelector)?.[0]?.toLowerCase() ?? null;
  const classNames = [...baseSelector.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/gu)].map((match) => match[1]);
  const id = /#([A-Za-z_][A-Za-z0-9_-]*)/u.exec(baseSelector)?.[1] ?? null;
  const nonEmptyAttributes = [
    ...baseSelector.matchAll(
      /:not\(\[([A-Za-z_:][A-Za-z0-9_.:-]*)=(?:""|'')\]\)/gu,
    ),
  ].map((match) => match[1]);
  const attributes = [...baseSelector.matchAll(/\[([A-Za-z_:][A-Za-z0-9_.:-]*)\]/gu)].map(
    (match) => match[1],
  );
  const unsupported = baseSelector
    .replace(/^[A-Za-z][A-Za-z0-9-]*/u, "")
    .replace(/\.[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/#[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/\[[A-Za-z_:][A-Za-z0-9_.:-]*\]/gu, "")
    .replace(
      /:not\(\[[A-Za-z_:][A-Za-z0-9_.:-]*=(?:""|'')\]\)/gu,
      "",
    )
    .trim();
  assert.equal(unsupported, "", `테스트 DOM이 지원하지 않는 선택자입니다: ${selector}`);
  if (tagName && element.tagName !== tagName) return false;
  if (id && element.getAttribute("id") !== id) return false;
  const actualClasses = new Set((element.getAttribute("class") ?? "").split(/\s+/u).filter(Boolean));
  return (
    classNames.every((className) => actualClasses.has(className)) &&
    attributes.every((attribute) => element.getAttribute(attribute) !== null) &&
    nonEmptyAttributes.every((attribute) => {
      const value = element.getAttribute(attribute);
      return value !== null && value.trim() !== "";
    }) &&
    childSelectors.every((childSelector) =>
      element.children.some(
        (child) =>
          typeof child !== "string" && matchesSimpleSelector(child, childSelector),
      ),
    )
  );
}

function matchesSelector(element, selector) {
  const tokens = selector
    .trim()
    .replaceAll(/\s*>\s*/gu, ">")
    .split(/(>|\s+)/u)
    .filter((token) => token && !/^\s+$/u.test(token));
  const compounds = [];
  const combinators = [];
  for (const token of tokens) {
    if (token === ">") combinators.push(">");
    else {
      if (compounds.length > combinators.length) combinators.push(" ");
      compounds.push(token);
    }
  }

  const matchesAt = (candidate, index) => {
    if (!candidate?.tagName || !matchesSimpleSelector(candidate, compounds[index])) {
      return false;
    }
    if (index === 0) return true;
    if (combinators[index - 1] === ">") {
      return matchesAt(candidate.parent, index - 1);
    }
    let ancestor = candidate.parent;
    while (ancestor?.tagName) {
      if (matchesAt(ancestor, index - 1)) return true;
      ancestor = ancestor.parent;
    }
    return false;
  };
  return compounds.length > 0 && matchesAt(element, compounds.length - 1);
}

function createMiniDomDocument() {
  return {
    createElement(name) {
      assert.equal(name, "template");
      let content = { querySelector: () => null, querySelectorAll: () => [] };
      return {
        get content() {
          return content;
        },
        set innerHTML(source) {
          const elements = collectElements(parseHtmlFragment(source));
          const querySelectorAll = (selector) =>
            elements.filter((element) => matchesSelector(element, selector));
          content = {
            querySelector: (selector) => querySelectorAll(selector)[0] ?? null,
            querySelectorAll,
          };
        },
      };
    },
  };
}

function createMiniDomParser() {
  return {
    parseFromString(source, mimeType) {
      assert.equal(mimeType, "text/html");
      return {
        doctype: /^\uFEFF?[\t\n\f\r ]*<!doctype[\t\n\f\r ]+html[\t\n\f\r ]*>/iu.test(source)
          ? { name: "html", publicId: "", systemId: "" }
          : null,
      };
    },
  };
}

function normalizeCssValue(value) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function createFixtureStyle(source) {
  const declarations = new Map();
  for (const declaration of source.split(";")) {
    if (!declaration.trim()) continue;
    const colonIndex = declaration.indexOf(":");
    if (colonIndex < 1 || !declaration.slice(colonIndex + 1).trim()) {
      throw new SyntaxError("CSS 선언의 속성 또는 값이 비어 있습니다.");
    }
    const property = declaration.slice(0, colonIndex).trim().toLowerCase();
    const rawValue = normalizeCssValue(declaration.slice(colonIndex + 1));
    const isImportant = /\s*!important$/iu.test(rawValue);
    declarations.set(property, {
      value: rawValue.replace(/\s*!important$/iu, "").trim(),
      priority: isImportant ? "important" : "",
    });
  }
  return {
    getPropertyValue(property) {
      return declarations.get(property.toLowerCase())?.value ?? "";
    },
    getPropertyPriority(property) {
      return declarations.get(property.toLowerCase())?.priority ?? "";
    },
    setProperty(property, value, priority = "") {
      declarations.set(property.toLowerCase(), {
        value: normalizeCssValue(value),
        priority: String(priority).toLowerCase(),
      });
    },
  };
}

function findClosingBrace(source, openingIndex) {
  let depth = 0;
  for (let index = openingIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }
  throw new SyntaxError("닫히지 않은 CSS 규칙이 있습니다.");
}

function parseCssRules(source) {
  const rules = [];
  let cursor = 0;
  while (cursor < source.length) {
    while (/\s/u.test(source[cursor] ?? "")) cursor += 1;
    if (cursor >= source.length) break;
    const openingIndex = source.indexOf("{", cursor);
    if (openingIndex < 0) throw new SyntaxError("CSS 규칙의 여는 중괄호가 없습니다.");
    const prelude = source.slice(cursor, openingIndex).trim();
    const closingIndex = findClosingBrace(source, openingIndex);
    const body = source.slice(openingIndex + 1, closingIndex);
    if (/^@media\s+/iu.test(prelude)) {
      const conditionText = prelude.replace(/^@media\s+/iu, "").trim();
      rules.push({
        type: 4,
        cssText: `@media ${conditionText} { ${body} }`,
        conditionText,
        cssRules: parseCssRules(body),
      });
    } else {
      rules.push({ selectorText: prelude, style: createFixtureStyle(body) });
    }
    cursor = closingIndex + 1;
  }
  return rules;
}

class FixtureStyleSheet {
  constructor() {
    this.cssRules = [];
  }

  replaceSync(source) {
    this.cssRules = parseCssRules(source.replaceAll(/\/\*[\s\S]*?\*\//g, ""));
  }
}

function mediaMatches(condition, viewportWidth) {
  const minWidth = /^\(min-width:\s*([0-9.]+)(px|rem)\)$/iu.exec(condition.trim());
  if (!minWidth) return false;
  const pixels = Number(minWidth[1]) * (minWidth[2].toLowerCase() === "rem" ? 16 : 1);
  return viewportWidth >= pixels;
}

function getSelectorSpecificity(selector) {
  const ids = selector.match(/#[A-Za-z_][A-Za-z0-9_-]*/gu)?.length ?? 0;
  const classes =
    selector.match(/\.[A-Za-z_][A-Za-z0-9_-]*|\[[^\]]+\]|:(?!:)[A-Za-z-]+/gu)?.length ?? 0;
  const types = selector
    .replace(/#[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/\.[A-Za-z_][A-Za-z0-9_-]*/gu, "")
    .replace(/\[[^\]]+\]/gu, "")
    .replace(/:{1,2}[A-Za-z-]+/gu, "")
    .split(/[\s>+~]+/u)
    .filter((part) => /^[A-Za-z][A-Za-z0-9-]*$/u.test(part)).length;
  return [ids, classes, types];
}

function compareSpecificity(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function selectorTargetsFixture(candidate, targetSelector, focusVisible) {
  const subject = candidate.trim().split(/[\s>+~]+/u).at(-1) ?? "";
  const hasFocusVisible = subject.includes(":focus-visible");
  if (focusVisible !== hasFocusVisible) return false;
  return subject.replaceAll(":focus-visible", "") === targetSelector;
}

function getFinalDeclaration(
  source,
  selector,
  property,
  viewportWidth = 1024,
  { focusVisible = false } = {},
) {
  let winner = null;
  let sourceOrder = 0;
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.cssRules) {
        if (mediaMatches(rule.conditionText, viewportWidth)) visit(rule.cssRules);
        continue;
      }
      for (const candidateSelector of rule.selectorText.split(",").map((item) => item.trim())) {
        sourceOrder += 1;
        if (!selectorTargetsFixture(candidateSelector, selector, focusVisible)) continue;
        const candidate = rule.style.getPropertyValue(property).trim();
        if (!candidate) continue;
        const declaration = {
          value: candidate,
          important: rule.style.getPropertyPriority(property) === "important",
          specificity: getSelectorSpecificity(candidateSelector),
          sourceOrder,
        };
        if (
          winner === null ||
          (declaration.important && !winner.important) ||
          (declaration.important === winner.important &&
            (compareSpecificity(declaration.specificity, winner.specificity) > 0 ||
              (compareSpecificity(declaration.specificity, winner.specificity) === 0 &&
                declaration.sourceOrder > winner.sourceOrder)))
        ) {
          winner = declaration;
        }
      }
    }
  };
  visit(parseCssRules(source.replaceAll(/\/\*[\s\S]*?\*\//g, "")));
  return winner?.value ?? null;
}

function countGridTracks(value) {
  if (!value || value === "none") return 0;
  const repeat = /^repeat\(\s*([0-9]+)\s*,/iu.exec(value);
  if (repeat) return Number(repeat[1]);
  let depth = 0;
  let count = 0;
  let inToken = false;
  for (const character of value.trim()) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (/\s/u.test(character) && depth === 0) {
      if (inToken) count += 1;
      inToken = false;
    } else {
      inToken = true;
    }
  }
  return count + (inToken ? 1 : 0);
}

function evaluateComputedCssFixture(source, assertion) {
  if (assertion.kind === "computed-focus-style") {
    return getFinalDeclaration(
      source,
      assertion.selector,
      assertion.property,
      1024,
      { focusVisible: true },
    );
  }
  if (assertion.kind === "computed-grid-column-count") {
    const display = getFinalDeclaration(
      source,
      assertion.selector,
      "display",
      assertion.viewportWidth,
    );
    if (display !== "grid" && display !== "inline-grid") return 0;
    return countGridTracks(
      getFinalDeclaration(
        source,
        assertion.selector,
        "grid-template-columns",
        assertion.viewportWidth,
      ),
    );
  }
  const value = getFinalDeclaration(source, assertion.selector, assertion.property);
  if (assertion.property === "gap" && /^1(?:\.0+)?rem$/u.test(value ?? "")) return "16px";
  return value;
}

async function evaluateProjectFiles(project, files) {
  const fileMap = new Map(files.map((file) => [file.path, file.source]));
  const htmlSource = project.files
    .filter((file) => file.languageId === "html")
    .map((file) => fileMap.get(file.path))[0];
  const results = [];
  for (const criterion of project.automaticCriteria) {
    const source = fileMap.get(criterion.filePath);
    const actual =
      criterion.evaluationKind === "html-dom-v1"
        ? await evaluateHtmlDomAssertion(
            { source, assertion: criterion.assertion },
            { documentRef: createMiniDomDocument(), domParserFactory: createMiniDomParser },
          )
        : ["computed-style", "computed-grid-column-count", "computed-focus-style"].includes(
              criterion.assertion.kind,
            )
          ? evaluateComputedCssFixture(source, criterion.assertion)
          : await evaluateCssStyleAssertion(
              { source, fixtureHtml: htmlSource, assertion: criterion.assertion },
              { styleSheetFactory: () => new FixtureStyleSheet() },
            );
    results.push({
      criterionId: criterion.id,
      passed: Object.is(actual, getWebAssertionExpected(criterion.assertion)),
    });
  }
  return results;
}

test("Web Project 콘텐츠는 JSON Schema와 별도 런타임 계약을 모두 통과한다", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.$id, "https://bam.dev/schema/web-project.schema.json");
  assert.deepEqual(getSchemaErrors(collection), []);
  assert.deepEqual(validateWebProjectCollection(collection, curriculum), []);
  assert.doesNotThrow(() => assertValidWebProjectCollection(collection, curriculum));

  const extra = structuredClone(collection);
  extra.projects[0].unexpected = true;
  assert.match(getSchemaErrors(extra).join("\n"), /unexpected.*허용되지 않은 필드/);
});

test("반응형 학습 계획 보드는 실제 교안 개념과 HTML·CSS 두 파일에 연결된다", () => {
  assert.equal(collection.projects.length, 1);
  const project = collection.projects[0];
  assert.equal(project.id, "web-project-responsive-learning-plan");
  assert.equal(project.slug, "responsive-learning-plan");
  assert.equal(project.revision, 2);
  assert.equal(project.order, 1);
  assert.deepEqual(
    project.files.map(({ path, languageId }) => ({ path, languageId })),
    [
      { path: "index.html", languageId: "html" },
      { path: "styles.css", languageId: "css" },
    ],
  );
  const lessons = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  for (const ref of project.conceptRefs) {
    const lesson = lessons.get(ref.lessonId);
    assert.ok(lesson, ref.lessonId);
    assert.ok(ref.conceptIds.every((conceptId) => lesson.conceptIds.includes(conceptId)));
  }
  assert.doesNotMatch(JSON.stringify(project), /비밀\s*테스트|숨김\s*테스트|secret\s*tests?|hidden\s*tests?/iu);
  assert.doesNotMatch(JSON.stringify(project.files), /javascript|<script\b/iu);
});

test("공개 자동 70점과 자가점검 30점은 순서·배점·scale을 명시한다", () => {
  const project = collection.projects[0];
  assert.equal(
    project.automaticCriteria.reduce((total, criterion) => total + criterion.maxPoints, 0),
    70,
  );
  assert.equal(
    project.manualCriteria.reduce((total, criterion) => total + criterion.maxPoints, 0),
    30,
  );
  assert.deepEqual(
    project.automaticCriteria.map((criterion) => criterion.order),
    project.automaticCriteria.map((_criterion, index) => index + 1),
  );
  assert.deepEqual(
    project.manualCriteria.map((criterion) => criterion.order),
    [1, 2, 3],
  );
  for (const criterion of project.manualCriteria) {
    assert.deepEqual(criterion.scale.map((level) => level.points), [0, 5, 10]);
  }
});

test("시작 코드·기준답안·대표오답은 동일한 HTML·CSS source preflight를 통과한다", () => {
  const project = collection.projects[0];
  const fixture = webProjectSolutionFixtures[project.id];
  assert.ok(fixture);
  const fileLanguage = new Map(project.files.map((file) => [file.path, file.languageId]));
  const allFiles = [
    ...project.files.map((file) => ({ path: file.path, source: file.starterSource })),
    ...fixture.referenceFiles,
    ...fixture.representativeWrongSolutions.flatMap((wrong) => wrong.files),
  ];
  for (const file of allFiles) {
    const evaluationKind = fileLanguage.get(file.path) === "html" ? "html-dom-v1" : "css-style-v1";
    assert.equal(
      findWebProjectSourceIssue(evaluationKind, file.source),
      null,
      `${file.path}: 안전하지 않은 source입니다.`,
    );
  }
});

test("v1 미리보기는 link 없이 제출 HTML과 CSS를 로컬 결합하는 계약이다", () => {
  const project = collection.projects[0];
  const starterHtml = project.files.find((file) => file.languageId === "html").starterSource;
  assert.match(project.instructions, /브라우저 안에서 직접 결합/);
  assert.doesNotMatch(starterHtml, /<link\b/iu);
  assert.deepEqual(
    findWebCodeQuestSourceIssue("html-dom-v1", '<link rel="stylesheet" href="styles.css">'),
    {
      code: "resource_element",
      message: "외부 문서나 기준 URL을 불러오는 base, link 요소는 사용할 수 없습니다.",
    },
  );
});

test("기준답안은 모든 공개 자동 기준을 통과하고 대표오답은 지정 기준에서 실패한다", async () => {
  const project = collection.projects[0];
  const fixture = webProjectSolutionFixtures[project.id];
  const referenceResults = await evaluateProjectFiles(project, fixture.referenceFiles);
  assert.deepEqual(
    referenceResults.filter((result) => !result.passed),
    [],
    "기준답안이 모든 공개 자동 기준을 통과해야 합니다.",
  );

  assert.ok(fixture.representativeWrongSolutions.length >= 2);
  const coveredFailureIds = new Set();
  for (const wrong of fixture.representativeWrongSolutions) {
    const results = await evaluateProjectFiles(project, wrong.files);
    wrong.expectedFailingAutomaticCriterionIds.forEach((criterionId) =>
      coveredFailureIds.add(criterionId),
    );
    assert.deepEqual(
      results.filter((result) => !result.passed).map((result) => result.criterionId),
      wrong.expectedFailingAutomaticCriterionIds,
      wrong.id,
    );
  }
  assert.deepEqual(
    [...coveredFailureIds].sort(),
    project.automaticCriteria.map((criterion) => criterion.id).sort(),
    "대표오답 집합이 모든 공개 자동 기준의 실패를 최소 한 번 검증해야 합니다.",
  );
});

test("공백 진도 이름·가짜 링크·한 카드에 몰아넣거나 숨긴 언어 이름은 통과하지 않는다", async () => {
  const project = collection.projects[0];
  const fixture = webProjectSolutionFixtures[project.id];
  const referenceHtml = fixture.referenceFiles.find((file) => file.path === "index.html");
  const referenceCss = fixture.referenceFiles.find((file) => file.path === "styles.css");
  const weakenedHtml = {
    path: "index.html",
    source: referenceHtml.source
      .replace('aria-label="HTML 학습 진도"', 'aria-label=" \n \t"')
      .replaceAll("<a class=\"learning-card-link\"", "<span class=\"learning-card-link\"")
      .replaceAll("</a>", "</span>")
      .replace('<a href="#plan">이번 주 계획</span>', '<a href="#plan">이번 주 계획</a>')
      .replace("<h2>HTML</h2>", "<h2>HTML CSS JavaScript</h2>")
      .replace("<h2>CSS</h2>", "<h2><span hidden>CSS</span>스타일</h2>")
      .replace("<h2>JavaScript</h2>", "<h2><span aria-hidden=\"true\">JavaScript</span>스크립트</h2>")
      .replace("JavaScript 계획 보기", "스크립트 계획 보기"),
  };

  const results = await evaluateProjectFiles(project, [weakenedHtml, referenceCss]);
  const failedIds = results
    .filter((result) => !result.passed)
    .map((result) => result.criterionId);
  for (const criterionId of [
    "auto-html-progress-label",
    "auto-html-learning-links",
    "auto-html-card-html-name",
    "auto-html-card-css-name",
    "auto-html-card-javascript-name",
  ]) {
    assert.ok(failedIds.includes(criterionId), criterionId);
  }
});

test("동등한 Grid 문법을 허용하고 뒤에서 무효화한 최종 레이아웃은 통과시키지 않는다", async () => {
  const project = collection.projects[0];
  const fixture = webProjectSolutionFixtures[project.id];
  const html = fixture.referenceFiles.find((file) => file.path === "index.html");
  const equivalentCss = {
    path: "styles.css",
    source: `.learning-board {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.learning-card-link:focus-visible {
  outline: 3px solid #2563eb;
}

@media (min-width: 48rem) {
  .learning-board { grid-template-columns: 1fr 1fr; }
}`,
  };
  const equivalentResults = await evaluateProjectFiles(project, [html, equivalentCss]);
  assert.deepEqual(
    equivalentResults.filter((result) => !result.passed),
    [],
    "동일한 최종 레이아웃을 만드는 CSS 문법은 허용해야 합니다.",
  );

  const referenceCss = fixture.referenceFiles.find((file) => file.path === "styles.css");
  const overriddenCss = {
    path: "styles.css",
    source: `${referenceCss.source}

.learning-board {
  display: block;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
}

@media (min-width: 48rem) {
  .learning-board { grid-template-columns: 1fr; }
}

main .learning-card-link:focus-visible {
  outline: none !important;
}`,
  };
  const overriddenResults = await evaluateProjectFiles(project, [html, overriddenCss]);
  const failedIds = overriddenResults
    .filter((result) => !result.passed)
    .map((result) => result.criterionId);
  for (const criterionId of [
    "auto-css-grid",
    "auto-css-gap",
    "auto-css-mobile-column",
    "auto-css-wide-columns",
    "auto-css-focus",
  ]) {
    assert.ok(failedIds.includes(criterionId), criterionId);
  }
});
