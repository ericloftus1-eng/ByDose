import "./art.css";

const stages = [
  { month: "December ’26", title: "A fresh start", detail: "Boards arrive. Old decks find a second life. Follow the sanding, repairs, and blank canvases." },
  { month: "January ’27", title: "Different hands", detail: "The plan: select five artists, get boards into their hands, and leave room to create." },
  { month: "February ’27", title: "One shared reveal", detail: "The finished artwork stays under wraps until we unveil the collection together." },
];

export default function Art() {
  return (
    <section className="secret-nine" aria-labelledby="secret-nine-title">
      <div className="nine-topline">
        <span>DOSE / First artist collection</span>
        <span className="nine-status">In the making</span>
      </div>
      <div className="nine-heading">
        <div>
          <p className="nine-eyebrow">A second life. A blank canvas.</p>
          <h2 id="secret-nine-title">The Secret <em>Nine.</em></h2>
          <p className="nine-deck">Nine boards. Five artist spots.<br />One big reveal.</p>
        </div>
        <div className="reveal-stamp" aria-label="Planned unveiling February 2027. Exact date to be announced.">
          <span>Planned unveiling</span>
          <strong>FEB<span>2027</span></strong>
          <span>Exact date to come</span>
        </div>
      </div>
      <p className="nine-intro">From street-inspired marks to a painted second life for an old board. We’re bringing different hands together to make something worth uncovering.</p>
      <div className="nine-actions">
        <a className="nine-primary" href="#artist-call">The five artist spots <span aria-hidden="true">↘</span></a>
        <a className="nine-secondary" href="#road-to-reveal">Follow the plan <span aria-hidden="true">↓</span></a>
      </div>

      <figure className="covered-gallery">
        <div className="board-lineup" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <div className="board-slot" key={index}>
              <div className="secret-board" style={{ "--board-index": index }}>
                <span className="board-bolts board-bolts-top" />
                <span className="board-seal">D<span>/</span>9</span>
                <span className="board-bolts board-bolts-bottom" />
              </div>
              <span className="board-number">0{index + 1}</span>
            </div>
          ))}
        </div>
        <figcaption><span>Nine canvases. Artwork under wraps.</span><span>Nothing revealed early.</span></figcaption>
      </figure>

      <section className="artist-call" id="artist-call" aria-labelledby="artist-call-title">
        <div className="artist-call-copy">
          <p className="nine-eyebrow">The artist invitation / Coming soon</p>
          <h3 id="artist-call-title">Your art.<br />Your board to keep.</h3>
          <p>Five selected artists will each receive a longboard to paint and keep. Bring your own style, share the making, and save the finished design for the collective unveiling.</p>
          <p className="entries-status">Entries aren’t open yet.</p>
          <p className="contest-note">Entry dates, eligibility, judging criteria, and full terms will be posted before submissions open. This preview does not collect entries.</p>
        </div>
        <div className="artist-details">
          <details>
            <summary>How will artists be chosen?</summary>
            <p>We’re planning a judged artist call for five spots, not a popularity vote. The submission brief and selection criteria are still being worked out.</p>
          </details>
          <details>
            <summary>What stays secret?</summary>
            <p>The finished board artwork. We can share board restoration and introduce the makers along the way, without giving away their designs.</p>
          </details>
          <details>
            <summary>What about prints and future boards?</summary>
            <p>We hope to offer prints and boards featuring the artwork after the reveal. Reproduction would only happen under a separate artist agreement covering permission, credit, approval, and payment. Keeping the original is separate from reproduction rights.</p>
          </details>
        </div>
      </section>

      <section className="reveal-road" id="road-to-reveal" aria-labelledby="reveal-road-title">
        <p className="nine-eyebrow">From the workshop to the wall</p>
        <h3 id="reveal-road-title">The road to the reveal.</h3>
        <ol>
          {stages.map((stage, index) => (
            <li key={stage.month}>
              <span className="stage-number">0{index + 1}</span>
              <p className="stage-month">{stage.month}</p>
              <h4>{stage.title}</h4>
              <p>{stage.detail}</p>
            </li>
          ))}
        </ol>
        <p className="reveal-note">Aiming for February 2027. We’ll start the countdown once the boards and artists are ready and the exact reveal date is set.</p>
      </section>
      <aside className="art-welcome">
        <span aria-hidden="true">✳</span>
        <div><h3>Every form of art belongs here.</h3><p>Graffiti, illustration, photography, painted decks, and your first experiments. Celebrate original work, legal walls, and permission-based projects. A broader community gallery is part of the vision—not open for uploads yet.</p></div>
      </aside>
    </section>
  );
}
