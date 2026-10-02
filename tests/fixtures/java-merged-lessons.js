// Java 교안 통합(2026-10-02): 기존 ID와 URL은 보관하고 본문 목적지만 합친다.
export const JAVA_MERGED_INTO = Object.freeze({
  "java-concept-constructors": "java-concept-objects",
  "java-concept-encapsulation": "java-concept-objects",
  "java-concept-abstract-interfaces": "java-concept-inheritance-dispatch",
  "java-concept-composition-injection": "java-concept-inheritance-dispatch",
  "java-concept-sets-maps": "java-concept-lists",
  "java-concept-deque": "java-concept-lists",
  "java-concept-collection-choice": "java-concept-lists",
  "java-concept-resources": "java-concept-exceptions",
  "java-concept-streams": "java-concept-lambdas",
  "java-concept-tasks-results": "java-concept-shared-state",
  "java-concept-test-tools": "java-concept-test-contracts",
});
export const JAVA_MERGED_TARGET_IDS = new Set(Object.values(JAVA_MERGED_INTO));
