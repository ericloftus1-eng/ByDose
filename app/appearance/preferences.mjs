export const storageKey = "dose-art-appearance-v1";
export const defaultAppearance = { theme: "asphalt", font: "bold" };

// Preset pairs are tested for contrast. No arbitrary CSS, URLs or HTML is stored.
export const themes = {
  asphalt: { label: "Asphalt", scheme: "dark", colors: {
    background: "#121410", panel: "#1c2119", field: "#11160f", text: "#eeefe3", muted: "#b5bea8", border: "#647154", accent: "#deff58", ink: "#202719", hover: "#eaf5c6", danger: "#ffbaa1", errorBackground: "#39271f", errorText: "#f0cbb4", successBackground: "#293620", successText: "#d9edba",
  } },
  paper: { label: "Paper", scheme: "light", colors: {
    background: "#f3efdf", panel: "#fffcf0", field: "#fffef9", text: "#23251e", muted: "#555b48", border: "#7b806c", accent: "#35451a", ink: "#fffef3", hover: "#425723", danger: "#8b301d", errorBackground: "#fbe5dc", errorText: "#752c1c", successBackground: "#e2ecd2", successText: "#2e471d",
  } },
  "after-hours": { label: "After Hours", scheme: "dark", colors: {
    background: "#180f25", panel: "#271a38", field: "#160e22", text: "#f7eefa", muted: "#c8b7d8", border: "#8f71aa", accent: "#ff92d8", ink: "#29112c", hover: "#ffb7e6", danger: "#ffbea5", errorBackground: "#402132", errorText: "#ffd0d8", successBackground: "#24322b", successText: "#c4f0d8",
  } },
};

export const fonts = {
  bold: { label: "Bold", body: "Arial, Helvetica, sans-serif", heading: '"ByDose Display", Impact, "Arial Narrow", sans-serif', weight: 900 },
  clean: { label: "Clean", body: "Arial, Helvetica, sans-serif", heading: "Arial, Helvetica, sans-serif", weight: 700 },
  typewriter: { label: "Typewriter", body: '"Courier New", Courier, monospace', heading: '"Courier New", Courier, monospace', weight: 700 },
};

const has = (options, value) => typeof value === "string" && Object.hasOwn(options, value);
export function normalizeAppearance(value) {
  return {
    theme: has(themes, value?.theme) ? value.theme : defaultAppearance.theme,
    font: has(fonts, value?.font) ? value.font : defaultAppearance.font,
  };
}
export function readAppearance(storage) {
  try { return normalizeAppearance(JSON.parse(storage.getItem(storageKey))); }
  catch { return { ...defaultAppearance }; }
}
export function saveAppearance(storage, value) {
  try { storage.setItem(storageKey, JSON.stringify(normalizeAppearance(value))); return true; }
  catch { return false; }
}
export function appearanceStyle(value) {
  const { theme, font } = normalizeAppearance(value);
  const style = Object.fromEntries(Object.entries(themes[theme].colors).map(([key, color]) => [`--dose-${key}`, color]));
  return { ...style, colorScheme: themes[theme].scheme, "--dose-body": fonts[font].body, "--dose-heading": fonts[font].heading, "--dose-weight": fonts[font].weight };
}
