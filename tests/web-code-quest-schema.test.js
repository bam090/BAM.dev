import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateSchemaValue } from "../scripts/validate-content.mjs";

const schemaUrl = new URL("../content/schema/web-code-quest.schema.json", import.meta.url);
const htmlCollectionUrl = new URL("../content/quests/html.json", import.meta.url);
const cssCollectionUrl = new URL("../content/quests/css.json", import.meta.url);

async function loadSchema() {
  return JSON.parse(await readFile(schemaUrl, "utf8"));
}

function getSchemaErrors(value, schema) {
  const errors = [];
  validateSchemaValue(value, schema, schema, "$", errors);
  return errors;
}

test("Web Code Quest 스키마는 HTML·CSS evaluationKind와 언어 쌍을 고정한다", async () => {
  const schema = await loadSchema();

  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.$id, "https://bam.dev/schema/web-code-quest.schema.json");
  assert.deepEqual(schema.properties.evaluationKind.enum, ["html-dom-v1", "css-style-v1"]);
  assert.deepEqual(schema.properties.languageId.enum, ["html", "css"]);
  assert.equal(schema.allOf.length, 2);
  assert.equal(
    schema.allOf[0].if.properties.evaluationKind.const,
    "html-dom-v1",
  );
  assert.equal(schema.allOf[0].then.properties.languageId.const, "html");
  assert.equal(schema.allOf[1].if.properties.evaluationKind.const, "css-style-v1");
  assert.equal(schema.allOf[1].then.properties.languageId.const, "css");
  assert.deepEqual(
    schema.allOf[0].then.properties.quests.items.not.required,
    ["fixtureHtml"],
  );
  assert.deepEqual(
    schema.allOf[1].then.properties.quests.items.required,
    ["fixtureHtml"],
  );
  assert.equal(
    schema.allOf[0].then.properties.quests.items.properties.publicTests.items.properties
      .assertion.$ref,
    "#/$defs/htmlAssertion",
  );
  assert.equal(
    schema.allOf[1].then.properties.quests.items.properties.publicTests.items.properties
      .assertion.$ref,
    "#/$defs/cssAssertion",
  );
  assert.equal(schema.additionalProperties, false);
});

test("공통 Quest 메타데이터·학습 지원·공개 평가 필드를 모두 요구한다", async () => {
  const schema = await loadSchema();
  const required = new Set(schema.$defs.quest.required);

  for (const field of [
    "id",
    "slug",
    "revision",
    "order",
    "lessonId",
    "conceptIds",
    "difficulty",
    "estimatedMinutes",
    "title",
    "summary",
    "instructions",
    "starterCode",
    "requirements",
    "examples",
    "publicTests",
    "failureExplanations",
    "hints",
    "commonMistakes",
  ]) {
    assert.ok(required.has(field), `${field}가 required에 있어야 합니다.`);
  }
  assert.ok(Object.hasOwn(schema.$defs.quest.properties, "fixtureHtml"));
  assert.equal(schema.$defs.quest.additionalProperties, false);
  assert.equal(schema.$defs.publicTest.additionalProperties, false);
  assert.equal(schema.$defs.failureExplanation.additionalProperties, false);
  assert.equal(schema.$defs.hint.additionalProperties, false);
  assert.equal(schema.$defs.commonMistake.additionalProperties, false);
  assert.deepEqual(schema.$defs.hint.properties.stage.enum, [
    "concept",
    "observation",
    "implementation",
  ]);
});

test("평가는 실행 코드가 아니라 열두 가지 허용목록 assertion만 표현한다", async () => {
  const schema = await loadSchema();
  const assertionRefs = schema.$defs.assertion.oneOf.map((entry) => entry.$ref);

  assert.deepEqual(assertionRefs, [
    "#/$defs/doctypePresentAssertion",
    "#/$defs/selectorExistsAssertion",
    "#/$defs/selectorCountAssertion",
    "#/$defs/attributeEqualsAssertion",
    "#/$defs/textIncludesAssertion",
    "#/$defs/nonblankAttributeCountAssertion",
    "#/$defs/directChildTextEqualsAssertion",
    "#/$defs/ruleDeclarationAssertion",
    "#/$defs/mediaRuleDeclarationAssertion",
    "#/$defs/computedStyleAssertion",
    "#/$defs/computedFocusStyleAssertion",
    "#/$defs/computedGridColumnCountAssertion",
  ]);
  for (const definitionName of assertionRefs.map((ref) => ref.split("/").at(-1))) {
    const definition = schema.$defs[definitionName];
    assert.equal(definition.type, "object");
    assert.equal(definition.additionalProperties, false);
    assert.ok(!Object.hasOwn(definition.properties, "code"));
    assert.ok(!Object.hasOwn(definition.properties, "function"));
    assert.ok(!Object.hasOwn(definition.properties, "script"));
  }
  assert.deepEqual(schema.$defs.publicTest.required, ["id", "label", "assertion"]);
  assert.deepEqual(schema.$defs.computedGridColumnCountAssertion.required, [
    "kind",
    "selector",
    "viewportWidth",
    "expected",
  ]);
  assert.equal(schema.$defs.computedGridColumnCountAssertion.properties.viewportWidth.minimum, 320);
  assert.equal(schema.$defs.computedGridColumnCountAssertion.properties.viewportWidth.maximum, 1920);
  assert.equal(schema.$defs.computedGridColumnCountAssertion.properties.expected.minimum, 1);
  assert.equal(schema.$defs.computedGridColumnCountAssertion.properties.expected.maximum, 12);
  assert.deepEqual(schema.$defs.nonblankAttributeCountAssertion.required, [
    "kind",
    "selector",
    "attribute",
    "expected",
  ]);
  assert.deepEqual(schema.$defs.directChildTextEqualsAssertion.required, [
    "kind",
    "selector",
    "childSelector",
    "childIndex",
    "textSelector",
    "expected",
  ]);
  assert.equal(schema.$defs.directChildTextEqualsAssertion.properties.childIndex.maximum, 99);
  assert.deepEqual(schema.$defs.computedFocusStyleAssertion.required, [
    "kind",
    "selector",
    "property",
    "expected",
  ]);
});

test("문제 수·예시 수·공개 테스트와 실패 설명 상한을 스키마에 고정한다", async () => {
  const schema = await loadSchema();
  const questProperties = schema.$defs.quest.properties;

  assert.equal(schema.properties.quests.minItems, 1);
  assert.equal(questProperties.examples.minItems, 1);
  assert.equal(questProperties.examples.maxItems, 3);
  assert.equal(questProperties.publicTests.minItems, 3);
  assert.equal(questProperties.publicTests.maxItems, 6);
  assert.equal(questProperties.failureExplanations.minItems, 3);
  assert.equal(questProperties.failureExplanations.maxItems, 6);
  assert.equal(questProperties.hints.minItems, 3);
  assert.equal(questProperties.hints.maxItems, 5);
});

test("조건부 items와 not(required)는 HTML fixture를 거부하고 CSS fixture를 요구한다", async () => {
  const [schema, htmlCollection, cssCollection] = await Promise.all([
    loadSchema(),
    readFile(htmlCollectionUrl, "utf8").then(JSON.parse),
    readFile(cssCollectionUrl, "utf8").then(JSON.parse),
  ]);

  assert.deepEqual(getSchemaErrors(htmlCollection, schema), []);
  assert.deepEqual(getSchemaErrors(cssCollection, schema), []);

  htmlCollection.quests[0].fixtureHtml = "<main>허용되지 않는 fixture</main>";
  assert.ok(
    getSchemaErrors(htmlCollection, schema).some(
      (error) => error.includes("$.quests[0]") && error.includes("not 조건"),
    ),
  );

  delete cssCollection.quests[0].fixtureHtml;
  assert.ok(
    getSchemaErrors(cssCollection, schema).some((error) =>
      error.includes("$.quests[0].fixtureHtml: 필수 필드"),
    ),
  );
});
