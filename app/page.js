"use client";

import { useEffect, useRef, useState } from "react";

const words = ["DELIBERATE", "OBSERVATION", "SLOW", "ENLIGHTENMENT"];
const point = (radius, angle) => [radius * Math.cos(angle), radius * Math.sin(angle)];
const hexagon = (radius) => Array.from({ length: 6 }, (_, i) => point(radius, i * Math.PI / 3));
const nodes = [[0, 0], ...hexagon(130), ...hexagon(260)];
const flower = [];
for (let q = -2; q <= 2; q++) {
  for (let r = -2; r <= 2; r++) {
    if (Math.abs(q + r) <= 2) flower.push([130 * (q + r / 2), 130 * Math.sqrt(3) / 2 * r]);
  }
}
const star = Array.from({ length: 16 }, (_, i) => point(i % 2 ? 63 : 128, -Math.PI / 2 + i * Math.PI / 8).join(",")).join(" ");

export default function Home() {
  const scene = useRef(null);
  const [text, setText] = useState("DOSE");
  const [visible, setVisible] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set();
    const later = (fn, delay) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
      timers.add(id);
    };
    const breathe = () => {
      if (!document.hidden && !motion.matches) {
        setPulse(true);
        later(() => setPulse(false), 3200);
        if (Math.random() < 0.08) {
          setVisible(false);
          later(() => {
            setText(words[Math.floor(Math.random() * words.length)]);
            setVisible(true);
            later(() => {
              setVisible(false);
              later(() => { setText("DOSE"); setVisible(true); }, 650);
            }, 2000);
          }, 650);
        }
      }
      later(breathe, 8000 + Math.random() * 2000);
    };
    later(breathe, 9000);
    return () => timers.forEach(clearTimeout);
  }, []);

  function move(event) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = Math.max(-10, Math.min(10, (event.clientX / window.innerWidth - 0.5) * 20));
    const y = Math.max(-10, Math.min(10, (event.clientY / window.innerHeight - 0.5) * 20));
    scene.current.style.setProperty("--x", `${x}px`);
    scene.current.style.setProperty("--y", `${y}px`);
  }
  function reset() {
    scene.current.style.setProperty("--x", "0px");
    scene.current.style.setProperty("--y", "0px");
  }

  return (
    <main className={`experience ${pulse ? "is-breathing" : ""}`} onPointerMove={move} onPointerLeave={reset}>
      <div className="parallax" ref={scene} aria-hidden="true">
        <div className="breath">
          <svg className="geometry" viewBox="-420 -420 840 840" fill="none">
            <g className="rings">
              {[330, 345, 385, 393].map(radius => <circle key={radius} r={radius} />)}
            </g>
            <g className="flower">
              {flower.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="130" />)}
            </g>
            <g className="cube">
              {nodes.flatMap(([x, y], i) => nodes.slice(i + 1).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} />))}
              {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="65" />)}
            </g>
            <polygon className="star" points={star} />
            <circle className="core" r="145" />
          </svg>
        </div>
      </div>
      <h1 aria-label="DOSE"><span className={`word ${visible ? "" : "word-hidden"} ${text === "DOSE" ? "" : "word-reveal"}`} aria-hidden="true">{text}</span></h1>
    </main>
  );
}
