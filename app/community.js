"use client";

import { useState } from "react";

const meanings = [
  {
    word: "Art",
    line: "Leave a little of yourself in the world.",
    description: "Art is how we turn what we feel into something we can share. A marker line, a painted deck, a custom color, a wild first attempt — it all belongs here. In the Dose community, you don’t need permission or a perfect piece. Just the urge to make something that is yours.",
    invitation: "Make it. Experiment. Share the process.",
  },
  {
    word: "Culture",
    line: "What we make becomes how we move.",
    description: "Culture is the living mix around the art: the music playing while you paint, the stories behind the marks, the places and people that shape your style. At Dose, we celebrate original voices, respect the roots, and leave room for something unexpected. We build it together, one exchange at a time.",
    invitation: "Honor the roots. Remix the everyday. Stay curious.",
  },
  {
    word: "Community",
    line: "Different hands. Shared energy.",
    description: "Community means there is space for you here — whether you have been creating for years or just picked up your first marker. Dose is about trading ideas, sharing tools, lifting each other up, and turning a solo spark into a collaboration. No gatekeeping. Just people making room for people.",
    invitation: "Pull up. Trade ideas. Help someone grow.",
  },
];

export default function Community({ headingRef, onBack }) {
  const [selected, setSelected] = useState("Art");
  const meaning = meanings.find(item => item.word === selected);

  return (
    <section className="collective" aria-labelledby="collective-title">
      <button className="back-button" onClick={onBack}>← Back to the intro</button>
      <header>
        <p className="collective-eyebrow">Artists · Makers · The painted world</p>
        <h1 className="collective-title" id="collective-title" ref={headingRef} tabIndex={-1}>DOSE ART<span>COLLECTIVE</span></h1>
        <p className="collective-intro">A little intention. A little chaos. Something we make together.</p>
      </header>
      <div className="meaning-buttons" role="group" aria-label="Explore what Dose means">
        {meanings.map(item => (
          <button key={item.word} aria-pressed={selected === item.word} aria-controls="meaning-panel" onClick={() => setSelected(item.word)}>{item.word}</button>
        ))}
      </div>
      <article className="meaning-panel" id="meaning-panel" aria-live="polite" aria-atomic="true">
        <p className="meaning-label">{meaning.word} / In the Dose community</p>
        <h2>{meaning.line}</h2>
        <p>{meaning.description}</p>
        <p className="meaning-invitation">{meaning.invitation}</p>
      </article>
      <p className="collective-footer">Make your mark. Make room for others.</p>
    </section>
  );
}
