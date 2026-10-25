"use client";

import { useEffect, useState } from "react";

const words = ["DELIBERATE", "OBSERVATION", "SLOW", "ENLIGHTENMENT"];

export default function Home() {
  const [text, setText] = useState("DOSE");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let revealTimeout;
    let pulseTimeout;
    const interval = setInterval(() => {
      setPulse(true);
      if (Math.random() < 0.15) {
        setText(words[Math.floor(Math.random() * words.length)]);
        revealTimeout = setTimeout(() => setText("DOSE"), 2500);
      }
      pulseTimeout = setTimeout(() => setPulse(false), 2000);
    }, 9000);
    return () => {
      clearInterval(interval);
      clearTimeout(revealTimeout);
      clearTimeout(pulseTimeout);
    };
  }, []);

  return (
    <main className="container">
      <div className={`geometry ${pulse ? "pulse" : ""}`} aria-hidden="true">
        <div className="circle outer" />
        <div className="circle inner" />
        <div className="line vertical" />
        <div className="line horizontal" />
      </div>
      <h1 className={pulse ? "pulseText" : ""}>{text}</h1>
    </main>
  );
}
