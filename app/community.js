"use client";

import s from "./hub.module.css";

export default function ByDoseHub({ headingRef, onBack }) {
  return (
    <section className={s.hub} aria-labelledby="bydose-title">
      <header className={s.header}>
        <a href="/hub" className={s.logo}>ByDose<span> / IN THE MAKING</span></a>
        <nav aria-label="ByDose navigation"><a href="/suggestions">Suggest an idea ↗</a><a href="/community">Your account ↗</a></nav>
      </header>
      <div className={s.main}>
        {onBack ? <button className={s.back} onClick={onBack}>← Back to the mandala</button> : <a className={s.back} href="/">← Back to the mandala</a>}
        <p className={s.eyebrow}>A LITTLE INTENTION. ROOM TO GROW.</p>
        <h1 id="bydose-title" ref={headingRef} tabIndex={-1}>NOT ONE THING.<br /><span>JUST THE START.</span></h1>
        <p className={s.intro}>ByDose is a place for ideas to take shape. We’re starting with art, rooted in the street. Where it goes next? Help us build it.</p>
        <div className={s.spaces}>
          <article className={s.artSpace}>
            <div className={s.wall} aria-hidden="true"><img src="/art/letters.svg" alt="" width="960" height="680" /><span>01 / ART · CULTURE · COMMUNITY</span></div>
            <div className={s.cardCopy}><p className={s.eyebrow}>THE FIRST SPACE</p><h2>DOSE ART<span>↗</span></h2><p>From blackbooks to big walls. Street art leads; every way of making belongs.</p><div className={s.actions}><a className={s.primary} href="/community">Enter DOSE Art →</a><a href="/art-preview">Explore the design demo ↗</a></div><small>Accounts & uploads: backend setup in progress. The design demo is fictional.</small></div>
          </article>
          <div className={s.future} aria-label="Future ByDose spaces">
            <button disabled className={s.shadow}><span>02 / STILL UNDER WRAPS</span><strong>SOMETHING<br />IS TAKING SHAPE.</strong><small>COMING SOON · NOT OPEN YET</small></button>
            <button disabled className={s.shadow}><span>03 / ROOM FOR THE UNEXPECTED</span><strong>THE NEXT DOSE<span>?</span></strong><small>COMING SOON · NOT OPEN YET</small></button>
          </div>
        </div>
        <section className={s.invitation}><div><p className={s.eyebrow}>BUILT WITH THE PEOPLE WHO USE IT.</p><h2>Got an idea for ByDose?</h2><p>A better layout. A missing feature. Something we haven’t thought of.</p></div><a className={s.primary} href="/suggestions">Suggest an idea ↗</a></section>
        <footer className={s.footer}>Art is the beginning. Not the limit.<span>BYDOSE / STILL BECOMING.</span></footer>
      </div>
    </section>
  );
}
