import assert from "node:assert/strict";
import { appearanceStyle, defaultAppearance, fonts, normalizeAppearance, readAppearance, saveAppearance, storageKey, themes } from "../app/appearance/preferences.mjs";

const values = new Map();
const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
assert.deepEqual(readAppearance(storage), defaultAppearance);
for (const theme of Object.keys(themes)) for (const font of Object.keys(fonts)) {
  assert.equal(saveAppearance(storage, { theme, font }), true);
  assert.deepEqual(readAppearance(storage), { theme, font });
  const style = appearanceStyle({ theme, font });
  assert.equal(style["--dose-background"], themes[theme].colors.background);
  assert.equal(style["--dose-heading"], fonts[font].heading);
}
for (const value of [null, {}, "bad", [], { theme: "__proto__", font: "constructor" }, { theme: 'url(javascript:bad)', font: 'bad;' }]) {
  assert.deepEqual(normalizeAppearance(value), defaultAppearance);
}
assert.deepEqual(normalizeAppearance({ theme: "paper", font: "invalid" }), { theme: "paper", font: "bold" });
values.set(storageKey, "not json");
assert.deepEqual(readAppearance(storage), defaultAppearance);
const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
assert.deepEqual(readAppearance(blocked), defaultAppearance);
assert.equal(saveAppearance(blocked, { theme: "paper", font: "clean" }), false);
assert.equal(saveAppearance(storage, defaultAppearance), true);
assert.deepEqual(readAppearance(storage), defaultAppearance);

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function ratio(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
for (const theme of Object.values(themes)) {
  const c = theme.colors;
  for (const surface of ["background", "panel", "field"]) {
    for (const text of ["text", "muted", "accent", "danger"]) assert.ok(ratio(c[surface], c[text]) >= 4.5, `${theme.label}: ${text} / ${surface}`);
    assert.ok(ratio(c[surface], c.border) >= 3, `${theme.label}: control border / ${surface}`);
  }
  for (const [bg, fg] of [["accent", "ink"], ["hover", "ink"], ["errorBackground", "errorText"], ["successBackground", "successText"]]) {
    assert.ok(ratio(c[bg], c[fg]) >= 4.5, `${theme.label}: ${fg} / ${bg}`);
  }
}
console.log("PASS: all 9 theme/font combinations, reload round trips, reset, invalid preferences, blocked storage, and WCAG AA normal-text/control contrast pairs.");
