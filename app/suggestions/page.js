"use client";

import { useEffect, useState } from "react";
import { getCommunityClient } from "../community/client";
import s from "../community/community.module.css";

export default function SuggestionsPage() {
  const [client, setClient] = useState(null);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = getCommunityClient();
    setClient(supabase);
    if (!supabase) { setReady(true); return; }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      setIdeas([]);
      setMessage("");
      setReady(true);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setError("Could not restore your session. Please sign in again.");
      setUser(data.session?.user || null);
      setReady(true);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    setIdeas([]);
    if (!client || !user) { setLoading(false); return; }
    setLoading(true);
    client.from("site_suggestions").select("id,title,details,category,status,created_at")
      .eq("author_id", user.id).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(50)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError("Your ideas could not load. Please try again. The suggestion database may still need setup.");
        else setIdeas(data);
        setLoading(false);
      });
    return () => { active = false; };
  }, [client, user, refresh]);

  async function submit(event) {
    event.preventDefault();
    if (busy || !client || !user) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = data.get("title").trim();
    const details = data.get("details").trim();
    if (!title || !details) { setError("Add a title and a little detail first."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getUser();
      if (sessionError || sessionData.user?.id !== user.id) throw new Error("Your session has expired. Sign in again before sending your idea.");
      const { error } = await client.from("site_suggestions").insert({ author_id: user.id, title, details, category: data.get("category") });
      if (error) throw new Error(error.code === "P0001" ? "You can send up to five ideas per day. Please try again tomorrow." : "Your idea wasn’t saved. Please try again; keep your text until you see confirmation.");
      form.reset();
      setMessage("Idea saved. Thanks for helping shape DOSE Art.");
      setRefresh(value => value + 1);
    } catch (issue) { setError(issue.message || "Your idea wasn’t saved. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className={s.root}>
    <a className={s.skip} href="#ideas">Skip to suggestions</a>
    <header className={s.header}><a className={s.logo} href="/community">DOSE Art<span> / BUILT TOGETHER</span></a><nav aria-label="DOSE Art navigation"><a href="/community">DOSE Art home</a><a href="/community">DOSE Art / Your account →</a></nav></header>
    <main className={s.main} id="ideas">
      <div className={s.intro}><p className={s.eyebrow}>HELP SHAPE WHAT COMES NEXT.</p><h1>SUGGEST<br /><span>AN IDEA.</span></h1><p>A design change, a missing feature, or a whole new direction. We’re listening.</p></div>
      {!ready && <p role="status">Opening the suggestion box…</p>}
      {ready && !client && <section className={s.setup}><p className={s.eyebrow}>SUGGESTION BOX / SETUP PENDING</p><h2>Your ideas deserve more than a disappearing demo.</h2><p>The form is built, but database and account setup still need to be completed. Nothing is collected or saved on this screen yet.</p><p className={s.small}>Once connected, sign in with your DOSE Art account to send an idea and see your previous submissions. Ideas are private to you and the site operator—not a public discussion board.</p><a className={s.linkButton} href="/community">Back to DOSE Art →</a></section>}
      {ready && client && !user && <section className={s.panel}><h2>One account. A say in what’s next.</h2><p className={s.small}>Sign in or create your DOSE Art account, then return here to suggest an idea. Submissions are private to you and the site operator.</p><a className={s.linkButton} href="/community">Sign in / Create an account →</a></section>}
      <p role="alert" className={error ? s.error : s.srOnly}>{error}</p><p role="status" className={message ? s.message : s.srOnly}>{message}</p>
      {client && user && <>
        <section className={s.panel}><h2>What would make DOSE Art better?</h2><p className={s.small}>Private to you and the site operator. Don’t include passwords, contact details, or sensitive information. Up to five ideas per day. Submitting an idea isn’t a promise that it will be built.</p>
          <form onSubmit={submit}><fieldset disabled={busy}><label>Give your idea a title<input name="title" required maxLength={120} placeholder="A better way to…" /></label><label>What kind of idea?<select name="category"><option>Site design</option><option>Feature</option><option>New space</option><option>Something else</option></select></label><label>Tell us more<textarea name="details" required maxLength={3000} rows={5} placeholder="What would you change, and how would it help?" /></label><button className={s.primary} type="submit">{busy ? "Saving…" : "Send your idea →"}</button></fieldset></form>
        </section>
        <section style={{ marginTop: 40 }}><div className={s.sectionTitle}><h2>Your latest ideas</h2><button disabled={loading || busy} onClick={() => { setError(""); setRefresh(value => value + 1); }}>Refresh</button></div><p className={s.small}>Your 50 most recent submissions. The site operator can review them in the backend.</p>{loading ? <p role="status">Loading your ideas…</p> : ideas.length ? ideas.map(idea => <article key={idea.id} className={s.suggestion}><p className={s.eyebrow}>{idea.category} / {idea.status}</p><h3>{idea.title}</h3><p>{idea.details}</p><time dateTime={idea.created_at}>{new Date(idea.created_at).toLocaleDateString("en", { dateStyle: "medium", timeZone: "UTC" })}</time></article>) : !error && <p className={s.empty}>No suggestions yet. Your first idea starts above.</p>}</section>
      </>}
      <footer className={s.footer}>DOSE Art · Art. Culture. Community.</footer>
    </main>
  </div>;
}
