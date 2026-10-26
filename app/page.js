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
  const [revealing, setRevealing] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set();
    const later = (fn, delay) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
      timers.add(id);
    };
    let wordIndex = 0;
    const breathe = () => {
      if (!document.hidden && !motion.matches) {
        setPulse(true);
        later(() => setPulse(false), 1400);
      }
      later(breathe, 3000);
    };
    const reveal = () => {
      if (!document.hidden && !motion.matches) {
        setText(words[wordIndex]);
        wordIndex = (wordIndex + 1) % words.length;
        setRevealing(true);
        later(() => { setRevealing(false); setText("DOSE"); }, 2400);
      }
      later(reveal, 5000);
    };
    later(breathe, 3000);
    later(reveal, 5000);
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
          <svg className="geometry" viewBox="-670 -670 1340 1340" fill="none">
            <defs>
              <radialGradient id="orb-metal" cx="30%" cy="25%" r="75%"><stop stopColor="#fff8dc" /><stop offset=".2" stopColor="#f3ca78" /><stop offset=".48" stopColor="#b77a2c" /><stop offset=".8" stopColor="#603016" /><stop offset="1" stopColor="#160c16" /></radialGradient>
              <linearGradient id="ray-metal"><stop stopColor="#ffe7a8" /><stop offset=".45" stopColor="#ce963e" /><stop offset="1" stopColor="#9d455d" stopOpacity="0" /></linearGradient>
              <radialGradient id="spark"><stop stopColor="#fff8dc" /><stop offset=".15" stopColor="#ffe6a0" stopOpacity=".9" /><stop offset="1" stopColor="#d4af37" stopOpacity="0" /></radialGradient>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff0bb" /><stop offset=".45" stopColor="#d4af37" /><stop offset=".65" stopColor="#fff1c4" /><stop offset="1" stopColor="#b67c25" /></linearGradient>
            </defs>
            <g className="rings">
              {[330, 345, 385, 393].map(radius => <circle key={radius} r={radius} />)}
            </g>
            <g className="reference-petals">
              {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx="0" cy="-115" rx="91" ry="164" transform={`rotate(${i * 60})`} />)}
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
            <g className="axis-beads">
              {[-1, 1].flatMap(sign => [40, 80, 120, 160, 200, 240, 280, 320, 400].map(distance => <circle key={`${sign}-${distance}`} cy={sign * distance} r={distance % 80 === 0 ? 2 : 1} fill="#ffe6a0" stroke="none" />))}
            </g>
            <g className="sparks" stroke="none">
              {[...hexagon(260), [0, -260], [0, 260], [0, -370], [0, 370], [-365, 0], [365, 0], [0, -168], [0, 168], [0, -211], [0, 211], [0, -315], [0, 315], [0, 0]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>
                <g className="orb-rays" style={{ "--ray-duration": `${7 + (i * 7 % 6)}s`, "--ray-delay": `${-i * 1.37}s` }}>
                  {Array.from({ length: 8 }, (_, ray) => <path key={ray} d="M0-1.8 225 0 0 1.8Z" fill="url(#ray-metal)" transform={`rotate(${ray * 45})`} />)}
                </g>
                <g className="orb-body" style={{ "--orb-duration": `${3.7 + (i * 3 % 5)}s`, "--orb-delay": `${-i * .91}s` }}>
                  <circle r="6" fill="url(#orb-metal)" stroke="#d7a653" strokeWidth=".6" />
                  <circle cx="-1.8" cy="-2" r="1.25" fill="#fff5d3" />
                  <path d="M-10-4 A12 12 0 0 1 10-6 M10 4 A12 12 0 0 1-10 6" fill="none" stroke="#c99349" strokeWidth=".85" />
                </g>
              </g>)}
            </g>
          </svg>
        </div>
      </div>
      <h1 aria-label="DOSE"><span className={`word ${revealing ? "word-approach" : ""}`} aria-hidden="true">
        <svg className="lettering" viewBox="0 0 740 190" role="presentation">
          <defs>
            <linearGradient id="letter-gold" x1="0" y1="0" x2="20%" y2="100%">
              <stop stopColor="#dfb86c" /><stop offset=".25" stopColor="#b98635" /><stop offset=".42" stopColor="#8b591d" /><stop offset=".48" stopColor="#523015" /><stop offset=".56" stopColor="#e6bc70" /><stop offset=".76" stopColor="#a36e29" /><stop offset=".87" stopColor="#6d391e" /><stop offset="1" stopColor="#bb843b" />
            </linearGradient>
          </defs>
          <text x="370" y="141" textAnchor="middle" fill="url(#letter-gold)" stroke="#f6d48a" strokeWidth=".55" fontSize={text === "DOSE" ? "166" : text.length > 10 ? "88" : text.length > 7 ? "100" : "150"} letterSpacing={text === "DOSE" ? "3" : "4"}>{text}</text>
        </svg>
      </span></h1>
    </main>
  );
}
