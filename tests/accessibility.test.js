import assert from "node:assert/strict";
import test from "node:test";

function relativeLuminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test("주요 버튼의 기본·hover 색 대비가 일반 텍스트 AA 기준을 충족한다", () => {
  assert.ok(contrastRatio("#4c8bf5", "#06101f") >= 4.5);
  assert.ok(contrastRatio("#5a96fa", "#06101f") >= 4.5);
});
