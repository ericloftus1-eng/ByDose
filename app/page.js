"use client";

import { useRef, useState } from "react";
import s from "./social.module.css";

const artists = [
  { id: "mara", name: "Mara Sol", handle: "marasol", initials: "MS", color: "#b0a0cf", medium: "Painter & color collector", bio: "Finding little worlds between shape, color, and the everyday. Sample artist profile for the DOSE layout." },
  { id: "eli", name: "Eli Rivers", handle: "elirivers", initials: "ER", color: "#bfc6a6", medium: "Light chaser · Photography", bio: "Quiet corners, long walks, and the things we almost miss. Sample artist profile for the DOSE layout." },
  { id: "june", name: "June Park", handle: "junemakes", initials: "JP", color: "#d6a184", medium: "Digital artist & daydreamer", bio: "Organic shapes and imaginary places. Usually making something a little strange. Sample artist profile for the DOSE layout." },
];
const initialPosts = [
  { id: "p1", artist: "mara", title: "Somewhere in between", caption: "Letting the colors have the conversation today. A little study in balance, and knowing when to stop.", medium: "Painting", image: "/art/balance.svg", alt: "Original abstract demo artwork with lavender arches, a rust-red circle, and a pale yellow sun", likes: 128, time: "2h", tag: "#colorstudies" },
  { id: "p2", artist: "eli", title: "The quiet hours", caption: "An imagined landscape, before the rest of the world wakes up. A study for my next photo walk.", medium: "Photography", image: "/art/quiet.svg", alt: "Illustrated placeholder landscape of olive hills, a pale sun, and a reflective lake", likes: 86, time: "4h", tag: "#lightandshadow" },
  { id: "p3", artist: "june", title: "Objects from a daydream", caption: "No brief. No destination. Just following a shape until it becomes something else.", medium: "Digital", image: "/art/objects.svg", alt: "Original demo digital artwork of a peach sculptural ribbon against a cobalt background", likes: 204, time: "6h", tag: "#digitalplay" },
];
const me = { id: "you", name: "Your studio", handle: "you", initials: "Y", color: "#d7dfb0", medium: "A work in progress", bio: "Your demo studio. The posts you create in this preview appear here until you reload." };
const categories = ["All work", "Painting", "Digital", "Photography"];

function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6Z" /></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    comment: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l1.7-4.2A8.5 8.5 0 1 1 21 11.5Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-7 5 8" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.compass}</svg>;
}
function Avatar({ artist, small = false }) {
  return <span className={`${s.avatar} ${small ? s.smallAvatar : ""}`} style={{ "--avatar": artist.color }}>{artist.initials}</span>;
}

export default function SocialHome() {
  const [view, setView] = useState("Feed");
  const [tab, setTab] = useState("For you");
  const [category, setCategory] = useState("All work");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [following, setFollowing] = useState(["mara"]);
  const [comments, setComments] = useState({});
  const [commentPost, setCommentPost] = useState(null);
  const [notice, setNotice] = useState("");
  const [composing, setComposing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [artwork, setArtwork] = useState("/art/balance.svg");
  const dialog = useRef(null);
  const trigger = useRef(null);
  const allArtists = [...artists, me];
  const toggle = (setter, value) => setter(previous => previous.includes(value) ? previous.filter(item => item !== value) : [...previous, value]);
  const visiblePosts = posts.filter(post => {
    const artist = allArtists.find(person => person.id === post.artist);
    const text = `${post.title} ${post.caption} ${post.tag} ${artist.name} ${artist.handle}`.toLowerCase();
    return (category === "All work" || post.medium === category) && text.includes(query.toLowerCase()) && (view !== "Saved" || saved.includes(post.id)) && (view !== "My studio" || post.artist === "you") && (view !== "Feed" || tab !== "Following" || following.includes(post.artist));
  });

  function openModal(kind, artist = null) {
    trigger.current = document.activeElement;
    setComposing(kind === "compose");
    setProfile(artist);
    if (kind === "compose") setArtwork("/art/balance.svg");
    dialog.current.showModal();
  }
  function closeModal() { dialog.current.close(); trigger.current?.focus(); }
  function changeView(next) { setView(next); setQuery(""); setCategory("All work"); setNotice(""); }
  function publish(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get("title").trim();
    const caption = data.get("caption").trim();
    if (!title || !caption) return;
    const medium = data.get("medium");
    setPosts(previous => [{ id: `local-${Date.now()}`, artist: "you", title, caption, medium, image: artwork, alt: "Selected demo artwork for your preview post", likes: 0, time: "Just now", tag: "#newwork" }, ...previous]);
    setView("Feed"); setTab("For you"); setCategory("All work"); setQuery("");
    setNotice("Your demo post is in the feed. It stays here until you reload.");
    event.currentTarget.reset(); closeModal();
  }

  return (
    <div className={s.social}>
      <a className={s.skip} href="#feed">Skip to feed</a>
      <header className={s.topbar}>
        <a href="/" className={s.brand} aria-label="DOSE home">dose<span>✳</span><small>ART IS A SOCIAL THING.</small></a>
        <label className={s.search}><Icon name="search" size={18} /><span className={s.srOnly}>Search artwork or artists</span><input type="search" placeholder="Find your next inspiration" value={query} onChange={event => setQuery(event.target.value)} /><kbd>/ art</kbd></label>
        <div className={s.topActions}><span className={s.previewLabel}>LAYOUT PREVIEW</span><button className={s.avatarButton} aria-label="Open your demo studio" onClick={() => changeView("My studio")}><Avatar artist={me} small /></button></div>
      </header>
      <div className={s.shell}>
        <aside className={s.sidebar}>
          <p className={s.eyebrow}>YOUR DAILY DOSE</p>
          <nav aria-label="Main navigation">
            {[["Feed", "home"], ["Explore", "compass"], ["Saved", "bookmark"], ["My studio", "user"]].map(([label, icon]) => <button key={label} className={view === label ? s.navActive : ""} aria-current={view === label ? "page" : undefined} onClick={() => changeView(label)}><Icon name={icon} />{label}{label === "Feed" && <span className={s.navDot} />}</button>)}
          </nav>
          <button className={s.createButton} onClick={() => openModal("compose")}><Icon name="plus" size={18} /> Create a post</button>
          <div className={s.sidebarCollection}><span className={s.miniFlower}>✳</span><p>A little intention.<br />A little chaos.</p><a href="/intro">The DOSE experience <span>↗</span></a></div>
          <div className={s.sidebarBottom}><p>Different hands.<br />Shared energy.</p><span>Art · Culture · Community</span><small>Demo artists & artwork.<br />Interactions reset on reload.</small></div>
        </aside>
        <main id="feed" className={s.main}>
          <section className={s.welcome}>
            <div><p className={s.eyebrow}>A PLACE FOR YOUR KIND OF DIFFERENT</p><h1>{view === "Feed" ? <>Good art.<br />Better company<span>.</span></> : view === "Explore" ? <>Find your next<br /><em>what if.</em></> : view === "Saved" ? <>Keep a little<br /><em>inspiration.</em></> : <>Your space.<br /><em>Your expression.</em></>}</h1><p className={s.welcomeText}>{view === "Feed" ? "Share what you make. Find your people. Stay a little curious." : view === "Explore" ? "Different mediums. Unexpected connections. Follow what moves you." : view === "Saved" ? "A personal collection of the pieces that made you pause." : "Your demo posts live here. Every artist starts somewhere."}</p></div>
            <div className={s.heroMark} aria-hidden="true"><div>✳</div><span>MAKE SOMETHING.<br />FEEL SOMETHING.</span></div>
          </section>
          <div className={s.demoNote}><span className={s.liveDot} /> A first look at the DOSE community <span>Sample content · No sign-up needed</span></div>
          <section className={s.feedSection} aria-label="Artwork feed">
            <div className={s.feedHeading}><div className={s.tabs} aria-label="Feed selection">{view === "Feed" ? ["For you", "Following"].map(label => <button key={label} aria-pressed={tab === label} className={tab === label ? s.activeTab : ""} onClick={() => setTab(label)}>{label}</button>) : <h2>{view === "Explore" ? "Discover something good" : view === "Saved" ? "Your saved pieces" : "From your studio"}</h2>}</div><span className={s.feedOrder}>A little inspiration ↓</span></div>
            <div className={s.filters} aria-label="Filter by medium">{categories.map(item => <button key={item} aria-pressed={category === item} className={category === item ? s.filterActive : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <p role="status" className={notice ? s.notice : s.srOnly}>{notice}</p>
            {query && <p className={s.results}>{visiblePosts.length} result{visiblePosts.length === 1 ? "" : "s"} for “{query}”</p>}
            <div className={s.posts}>
              {visiblePosts.map(post => {
                const artist = allArtists.find(person => person.id === post.artist);
                return <article key={post.id} className={s.post}>
                  <div className={s.postHeader}><button className={s.artistButton} onClick={() => openModal("profile", artist)}><Avatar artist={artist} /><span><strong>{artist.name}</strong><small>@{artist.handle} <span>· {post.time}</span></small></span></button><span className={s.medium}>{post.medium}</span></div>
                  <div className={s.artwork}><img src={post.image} alt={post.alt} width="960" height="680" /><span className={s.artworkLabel}>DOSE STUDY / {post.medium.toUpperCase()}</span></div>
                  <div className={s.postContent}><div className={s.postActions}><div><button aria-label={`${liked.includes(post.id) ? "Unlike" : "Like"} ${post.title}`} aria-pressed={liked.includes(post.id)} className={liked.includes(post.id) ? s.liked : ""} onClick={() => toggle(setLiked, post.id)}><Icon name="heart" /> <span>{post.likes + Number(liked.includes(post.id))}</span></button><button aria-label={`Comments on ${post.title}`} aria-expanded={commentPost === post.id} onClick={() => setCommentPost(commentPost === post.id ? null : post.id)}><Icon name="comment" /><span>{(comments[post.id] || []).length}</span></button></div><button aria-label={`${saved.includes(post.id) ? "Unsave" : "Save"} ${post.title}`} aria-pressed={saved.includes(post.id)} className={saved.includes(post.id) ? s.isSaved : ""} onClick={() => toggle(setSaved, post.id)}><Icon name="bookmark" /></button></div><h3>{post.title}</h3><p>{post.caption}</p><button className={s.hashtag} onClick={() => { setQuery(post.tag); }}>{post.tag}</button>
                  {commentPost === post.id && <div className={s.comments}><p className={s.commentNote}>Join the conversation · demo comments</p>{(comments[post.id] || []).map((text, index) => <p className={s.comment} key={index}><strong>You</strong> {text}</p>)}<form onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const text = new FormData(form).get("comment").trim(); if (!text) return; setComments(previous => ({ ...previous, [post.id]: [...(previous[post.id] || []), text] })); form.reset(); }}><label className={s.srOnly} htmlFor={`comment-${post.id}`}>Your comment</label><input id={`comment-${post.id}`} name="comment" placeholder="Leave a little encouragement…" maxLength={500} required /><button type="submit">Post</button></form></div>}
                  </div>
                </article>;
              })}
              {!visiblePosts.length && <div className={s.empty}><Icon name={view === "Saved" ? "bookmark" : "image"} size={32} /><h3>{query ? "Nothing here just yet" : view === "Saved" ? "Make room for inspiration" : view === "My studio" ? "Your first mark starts here" : "A fresh canvas"}</h3><p>{query ? "Try another artist, title, or tag." : view === "Saved" ? "Tap the bookmark on a piece to collect it here." : view === "My studio" ? "Create a demo post and make this space yours." : "Try another medium, or follow an artist to see their work."}</p><button onClick={() => { if (view === "My studio") openModal("compose"); else { changeView("Explore"); setTab("For you"); } }}>{view === "My studio" ? "Create your first post" : "Explore artwork"} <Icon name="arrow" size={16} /></button></div>}
            </div>
            <p className={s.feedFooter}>You’re in good creative company. <span>✳</span></p>
          </section>
        </main>
        <aside className={s.rightbar}>
          <section className={s.artistSuggestions}><div className={s.sectionHeading}><h2>Find your people</h2><span>↗</span></div><p>A few creative souls to start with.</p>{artists.map(artist => <div className={s.suggestion} key={artist.id}><button className={s.artistButton} onClick={() => openModal("profile", artist)}><Avatar artist={artist} small /><span><strong>{artist.name}</strong><small>{artist.medium.split(" · ")[0]}</small></span></button><button className={s.follow} aria-label={`${following.includes(artist.id) ? "Unfollow" : "Follow"} ${artist.name}`} aria-pressed={following.includes(artist.id)} onClick={() => toggle(setFollowing, artist.id)}>{following.includes(artist.id) ? "✓" : "+"}</button></div>)}</section>
          <section className={s.projectCard}><div className={s.projectTop}>FROM THE COLLECTIVE <span>01 / 09</span></div><div className={s.boardRow} aria-hidden="true">{[0, 1, 2, 3, 4].map(n => <span key={n} style={{ "--n": n }} />)}</div><span className={s.projectEyebrow}>NINE BOARDS. DIFFERENT HANDS.</span><h2>The Secret Nine<span>.</span></h2><p>A second life for old decks.<br />A new canvas for original voices.</p><a href="/collection">Explore the project <Icon name="arrow" size={17} /></a><small>Planned reveal · February 2027<br />Artist entries are not open.</small></section>
          <section className={s.prompt}><span className={s.eyebrow}>A LITTLE CREATIVE NUDGE</span><h2>Make something<br />just because.</h2><p>Not everything needs a brief.<br />Your work in progress belongs here, too.</p><button onClick={() => openModal("compose")}>Share a work in progress <span>↗</span></button></section>
          <p className={s.rightFooter}>A space for original work & open minds.<br />Respect the artist. Credit the inspiration.<br /><span>© {new Date().getFullYear()} DOSE Art Collective</span></p>
        </aside>
      </div>
      <button className={s.mobileCreate} aria-label="Create a post" onClick={() => openModal("compose")}><Icon name="plus" /></button>
      <dialog ref={dialog} className={s.dialog} aria-labelledby="dialog-title" onClick={event => { if (event.target === event.currentTarget) closeModal(); }} onCancel={() => trigger.current?.focus()}>
        <div className={s.dialogTop}><span className={s.eyebrow}>YOUR LITTLE CORNER OF DOSE</span><button aria-label="Close dialog" onClick={closeModal}><Icon name="close" /></button></div>
        {composing ? <form className={s.composer} onSubmit={publish}><h2 id="dialog-title">Make your mark<span>.</span></h2><p>This is a demo. Choose sample artwork to try the layout. Nothing is uploaded or published publicly.</p><label htmlFor="post-title">Give it a name</label><input id="post-title" name="title" placeholder="An idea, a feeling, a happy accident…" maxLength={100} required /><label htmlFor="post-caption">The story behind it</label><textarea id="post-caption" name="caption" placeholder="What have you been making?" maxLength={1200} rows={3} required /><label htmlFor="post-medium">Medium</label><select id="post-medium" name="medium"><option>Painting</option><option>Digital</option><option>Photography</option></select><fieldset><legend>Choose demo artwork</legend><div className={s.artChoices}>{initialPosts.map(post => <label key={post.id}><input type="radio" name="artwork" value={post.image} checked={artwork === post.image} onChange={() => setArtwork(post.image)} /><img src={post.image} alt={post.alt} width="160" height="110" /></label>)}</div></fieldset><button className={s.publish} type="submit">Add to demo feed <Icon name="arrow" size={18} /></button><small>Posts, likes, comments, and follows reset on reload.</small></form> : profile && <section className={s.profile}><Avatar artist={profile} /><h2 id="dialog-title">{profile.name}</h2><span>@{profile.handle}</span><h3>{profile.medium}</h3><p>{profile.bio}</p>{profile.id !== "you" && <button className={s.publish} aria-pressed={following.includes(profile.id)} onClick={() => toggle(setFollowing, profile.id)}>{following.includes(profile.id) ? "Following ✓" : "Follow artist +"}</button>}<button className={s.profileWork} onClick={() => { changeView(profile.id === "you" ? "My studio" : "Explore"); if (profile.id !== "you") setQuery(profile.name); closeModal(); }}>View artwork <Icon name="arrow" size={18} /></button></section>}
      </dialog>
    </div>
  );
}
