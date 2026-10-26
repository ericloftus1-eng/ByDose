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
            <defs>
              <radialGradient id="spark"><stop stopColor="#fff8dc" /><stop offset=".15" stopColor="#ffe6a0" stopOpacity=".9" /><stop offset="1" stopColor="#d4af37" stopOpacity="0" /></radialGradient>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff0bb" /><stop offset=".45" stopColor="#d4af37" /><stop offset=".65" stopColor="#fff1c4" /><stop offset="1" stopColor="#b67c25" /></linearGradient>
            </defs>
            <g className="rings">
              {[330, 345, 385, 393].map(radius => <circle key={radius} r={radius} />)}
            </g>
            <g className="fine-rings">
              {[205, 222, 278, 302, 318].map(radius => <circle key={radius} r={radius} />)}
            </g>
            <g className="triangles">
              <polygon points="0,-315 273,158 -273,158" />
              <polygon points="0,315 -273,-158 273,-158" />
            </g>
            <circle className="dotted-ring" r="363" strokeDasharray="1 11" strokeLinecap="round" />
            <g className="ornaments">
              {[-1, 1].map(sign => <g key={sign}>
                <circle cy={sign * 270} r="91" />
                <circle cy={sign * 294} r="27" />
                <circle cy={sign * 211} r="43" />
                <circle cy={sign * 398} r="4" />
                <circle cy={sign * 370} r="12" />
                <circle cx={sign * 365} r="20" />
                <circle cx={sign * 401} r="8" />
              </g>)}
              <line x1="0" y1="-412" x2="0" y2="412" />
              <line x1="-412" y1="0" x2="412" y2="0" />
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
            <g className="sparks" stroke="none">
              {[...hexagon(260), [0, -260], [0, 260], [0, -370], [0, 370], [-365, 0], [365, 0], [0, -168], [0, 168], [0, -211], [0, 211], [0, -315], [0, 315], [0, 0]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="30" fill="url(#spark)" />
                <path d="M-25 0H25M0-25V25" stroke="#e6b64c" strokeWidth=".25" />
                <path d="M-15 0H15M0-15V15" stroke="#ffe7ab" strokeWidth=".55" />
                <circle r="1.7" fill="#fff5d4" />
              </g>)}
            </g>
          </svg>
        </div>
      </div>
      <h1 aria-label="DOSE"><span className={`word ${visible ? "" : "word-hidden"} ${text === "DOSE" ? "" : "word-reveal"}`} aria-hidden="true">
        <svg className="lettering" viewBox="0 0 740 190" role="presentation">
          <defs>
            <linearGradient id="letter-gold" x1="0" y1="0" x2="0.2" y2="1">
              <stop stopColor="#fff6d6" /><stop offset=".25" stopColor="#e9bb60" /><stop offset=".42" stopColor="#8b591d" /><stop offset=".48" stopColor="#523015" /><stop offset=".56" stopColor="#ffe9a1" /><stop offset=".76" stopColor="#a36e29" /><stop offset=".87" stopColor="#6d391e" /><stop offset="1" stopColor="#fff0bd" />
            </linearGradient>
          </defs>
          <text x="370" y="141" textAnchor="middle" fill="url(#letter-gold)" stroke="#f6d48a" strokeWidth=".55" fontSize={text === "DOSE" ? "166" : "62"} letterSpacing={text === "DOSE" ? "3" : "4"}>{text}</text>
        </svg>
      </span></h1>
    </main>
  );
}
