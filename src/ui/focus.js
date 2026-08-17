export function getFocusLoopTarget(focusableElements, activeElement, movingBackward = false) {
  const elements = [...focusableElements].filter(Boolean);
  if (elements.length === 0) return null;

  const firstElement = elements[0];
  const lastElement = elements.at(-1);

  if (!elements.includes(activeElement)) {
    return movingBackward ? lastElement : firstElement;
  }
  if (movingBackward && activeElement === firstElement) return lastElement;
  if (!movingBackward && activeElement === lastElement) return firstElement;
  return null;
}

export function focusMainContent(target, browserWindow = globalThis.window) {
  if (!target || typeof target.focus !== "function") return false;

  browserWindow?.scrollTo?.({ top: 0, behavior: "instant" });
  target.focus({ preventScroll: true });
  return true;
}
