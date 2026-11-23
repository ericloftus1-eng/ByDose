"use client";

import { useEffect, useId, useState } from "react";
import { appearanceStyle, defaultAppearance, fonts, normalizeAppearance, readAppearance, saveAppearance, storageKey, themes } from "./preferences.mjs";
import s from "./appearance.module.css";

export default function Appearance({ children }) {
  const [choice, setChoice] = useState(defaultAppearance);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const id = useId();

  useEffect(() => {
    try { setChoice(readAppearance(window.localStorage)); } catch { /* Storage may be blocked. */ }
    setReady(true);
    function sync(event) {
      if (event.key === storageKey || event.key === null) {
        try { setChoice(readAppearance(window.localStorage)); } catch { /* Keep the current look. */ }
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function update(next) {
    const value = normalizeAppearance(next);
    setChoice(value);
    let saved = false;
    try { saved = saveAppearance(window.localStorage, value); } catch { /* Use state when storage is unavailable. */ }
    setNotice(saved ? "Your look is saved in this browser." : "Look changed for this visit. This browser is blocking saved preferences.");
  }

  return <div className={s.surface} style={appearanceStyle(choice)} data-dose-theme={choice.theme} data-dose-font={choice.font}>
    <div className={s.bar}>
      <details className={s.picker}>
        <summary>Your look <span>{themes[choice.theme].label} / {fonts[choice.font].label}</span></summary>
        <div className={s.content}>
          <p>Make DOSE Art feel like you. Only changes your view—not anyone else’s page or artwork.</p>
          <div className={s.controls}>
            <label htmlFor={`${id}-theme`}>Color theme<select id={`${id}-theme`} value={choice.theme} disabled={!ready} onChange={event => update({ ...choice, theme: event.target.value })}>{Object.entries(themes).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
            <label htmlFor={`${id}-font`}>Font style<select id={`${id}-font`} value={choice.font} disabled={!ready} onChange={event => update({ ...choice, font: event.target.value })}>{Object.entries(fonts).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
            <button type="button" disabled={!ready} onClick={() => update(defaultAppearance)}>Reset look</button>
          </div>
          <p className={s.note}>Applies to the DOSE Art community and its suggestion box. Saved on this browser only; no account or database update needed.</p>
          <p className={s.status} role="status">{notice}</p>
        </div>
      </details>
    </div>
    {children}
  </div>;
}
