"use client";

import { useId, useState } from "react";
import s from "./community.module.css";

export default function PasswordField({ mode }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return <div className={s.passwordField}>
    <label htmlFor={id}>Password</label>
    <div className={s.passwordControls}>
      <input id={id} type={visible ? "text" : "password"} name="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        required minLength={12} maxLength={128} spellCheck={false} autoCapitalize="none" autoCorrect="off" />
      <button type="button" aria-controls={id} onClick={() => setVisible(value => !value)}>{visible ? "Hide password" : "Show password"}</button>
    </div>
    <small>At least 12 characters.</small>
  </div>;
}
