"use client";

import { useEffect, useRef, useState } from "react";
import { getCommunityClient, mediaUrl, uploadImage } from "./client";
import s from "./community.module.css";

const mediums = [
  "Graffiti",
  "Murals",
  "Blackbooks",
  "Painting",
  "Digital",
  "Photography",
  "Sculpture",
  "Mixed media",
  "Other",
];
const pageSize = 12;

function Avatar({ profile, supabase }) {
  const url = mediaUrl(supabase, "dose-avatars", profile?.avatar_path);
  return url ? (
    <img className={s.avatar} src={url} alt="" width="44" height="44" />
  ) : (
    <span className={s.avatar} aria-hidden="true">
      {(profile?.display_name || "A").slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function CommunityPage() {
  const [supabase, setSupabase] = useState(null);
  const [ready, setReady] = useState(false);
  const [feedChoiceReady, setFeedChoiceReady] = useState(false);
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [artist, setArtist] = useState(null);
  const [view, setView] = useState("feed");
  const [authMode, setAuthMode] = useState("signin");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const queryVersion = useRef(0);
  const profileVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const client = getCommunityClient();
    setSupabase(client);
    if (!client) {
      setReady(true);
      return;
    }
    // Auth changes only drive UI. Postgres and Storage policies authorize every write.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      setMyProfile(null);
      if (event === "PASSWORD_RECOVERY") {
        setView("auth");
        setAuthMode("newpassword");
      }
      if (event === "SIGNED_OUT") {
        setView("feed");
        setArtist(null);
      }
      setReady(true);
    });
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError)
        setError("Your session could not be restored. Please sign in again.");
      setUser(data.session?.user || null);
      setReady(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const version = ++profileVersion.current;
    if (!supabase || !user) {
      setMyProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error: profileError }) => {
        if (version !== profileVersion.current) return;
        if (profileError)
          setError(
            "Your artist profile could not be loaded. The community database may still need setup.",
          );
        else setMyProfile(data);
      });
  }, [supabase, user, refresh]);

  useEffect(() => {
    const version = ++queryVersion.current;
    if (!supabase || !["feed", "gallery"].includes(view)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setPosts([]);
    setHasMore(false);
    let query = supabase
      .from("posts")
      .select(
        "*, profiles!posts_artist_id_fkey(id,username,display_name,medium,avatar_path)",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(0, pageSize - 1);
    if (artist) query = query.eq("artist_id", artist.id);
    else if (feedChoiceReady) query = query.eq("show_in_feed", true);
    query.then(({ data, error: feedError }) => {
      if (!active || version !== queryVersion.current) return;
      if (feedError)
        setError(
          "The gallery could not load. Try again; if this is a new preview, its database may still need setup.",
        );
      else {
        setPosts(data);
        setHasMore(data.length === pageSize);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [supabase, view, artist, refresh, feedChoiceReady]);

  useEffect(() => {
    let active = true;
    if (!supabase) return;
    supabase.from("posts").select("show_in_feed").limit(0).then(({ error }) => {
      if (active) setFeedChoiceReady(!error);
    });
    return () => { active = false; };
  }, [supabase, refresh]);

  function go(next, nextArtist = null) {
    setError("");
    setMessage("");
    setArtist(nextArtist);
    setView(next);
    setDeleting(null);
  }
  function requireUser(next) {
    if (user) go(next);
    else {
      go("auth");
      setAuthMode("signin");
      setMessage("Sign in to make this space yours.");
    }
  }
  async function perform(work) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (issue) {
      setError(issue.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function authenticate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get("email")?.trim();
    const password = data.get("password");
    await perform(async () => {
      const redirectTo = `${window.location.origin}/community`;
      if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error)
          throw new Error(
            "Could not request a reset. Please wait a moment and try again.",
          );
        setMessage(
          "If an account exists for that email, you’ll receive a password-reset link.",
        );
      } else if (authMode === "newpassword") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error)
          throw new Error(
            "Could not update your password. Request a fresh reset link and try again.",
          );
        form.reset();
        go("feed");
        setMessage("Password updated.");
      } else if (authMode === "signup") {
        const { data: result, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error)
          throw new Error(
            "Could not create your account. Check your details or try signing in. Please wait before retrying.",
          );
        form.reset();
        if (result.session) {
          go("profile");
          setMessage("Welcome. Give your studio a name.");
        } else
          setMessage(
            "Check your email to confirm your account, then sign in. If you already have an account, use Sign in.",
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error)
          throw new Error(
            "Could not sign in. Check your email and password, and confirm your email first.",
          );
        form.reset();
        go("feed");
      }
    });
  }

  async function saveProfile(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await perform(async () => {
      if (!user || !myProfile)
        throw new Error("Sign in again to edit your profile.");
      let newAvatar;
      const avatar = data.get("avatar");
      if (avatar?.size)
        newAvatar = await uploadImage(
          supabase,
          user.id,
          "dose-avatars",
          avatar,
        );
      const values = {
        username: data.get("username").trim().toLowerCase(),
        display_name: data.get("display_name").trim(),
        bio: data.get("bio").trim(),
        medium: data.get("medium").trim(),
        avatar_path: newAvatar || myProfile.avatar_path,
      };
      const { data: updated, error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id)
        .select()
        .single();
      if (error) {
        if (newAvatar)
          await supabase.storage.from("dose-avatars").remove([newAvatar]);
        throw new Error(
          error.code === "23505"
            ? "That username is already taken. Try another."
            : "Profile could not be saved. Check your fields and try again.",
        );
      }
      const oldAvatar = myProfile.avatar_path;
      setMyProfile(updated);
      go("gallery", updated);
      setRefresh((n) => n + 1);
      setMessage("Your artist profile is saved.");
      if (newAvatar && oldAvatar) {
        const { error: cleanupError } = await supabase.storage
          .from("dose-avatars")
          .remove([oldAvatar]);
        if (cleanupError)
          setMessage(
            "Profile saved. Your previous public avatar could not be removed; contact the site owner to clean it up.",
          );
      }
    });
  }

  async function publish(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await perform(async () => {
      if (!user || !myProfile)
        throw new Error("Finish your artist profile before posting.");
      if (!data.get("rights"))
        throw new Error(
          "Confirm that you have permission to share this artwork.",
        );
      const path = await uploadImage(
        supabase,
        user.id,
        "dose-artwork",
        data.get("artwork"),
      );
      const { error } = await supabase
        .from("posts")
        .insert({
          artist_id: user.id,
          title: data.get("title").trim(),
          caption: data.get("caption").trim(),
          medium: data.get("medium"),
          alt_text: data.get("alt_text").trim(),
          image_path: path,
          ...(feedChoiceReady ? { show_in_feed: data.get("show_in_feed") === "on" } : {}),
        });
      if (error) {
        const { error: cleanupError } = await supabase.storage
          .from("dose-artwork")
          .remove([path]);
        throw new Error(
          cleanupError
            ? "Post could not be saved. An unlinked public upload remains; contact the site owner to remove it before retrying."
            : "Post could not be saved. Your upload has been removed. Please try again.",
        );
      }
      form.reset();
      go("gallery", myProfile);
      setRefresh((n) => n + 1);
      setMessage(feedChoiceReady && !data.get("show_in_feed")
        ? "Your artwork is published to your artist profile only—not the DOSE Art main feed. It is still public."
        : "Your artwork is published to your artist profile and DOSE Art’s main feed.");
    });
  }

  async function removePost(post) {
    await perform(async () => {
      const { data, error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .select("id");
      if (error || !data?.length)
        throw new Error(
          "This post could not be deleted. Sign in again and retry.",
        );
      setPosts((previous) => previous.filter((item) => item.id !== post.id));
      setDeleting(null);
      const { error: cleanupError } = await supabase.storage
        .from("dose-artwork")
        .remove([post.image_path]);
      setMessage(
        cleanupError
          ? "Post removed from the gallery, but its public image could not be removed. Contact the site owner for cleanup."
          : "Post deleted. Cached copies of public images may remain temporarily.",
      );
    });
  }

  async function loadMore() {
    const version = queryVersion.current;
    await perform(async () => {
      let query = supabase
        .from("posts")
        .select(
          "*, profiles!posts_artist_id_fkey(id,username,display_name,medium,avatar_path)",
        )
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(posts.length, posts.length + pageSize - 1);
      if (artist) query = query.eq("artist_id", artist.id);
      else if (feedChoiceReady) query = query.eq("show_in_feed", true);
      const { data, error } = await query;
      if (version !== queryVersion.current) return;
      if (error) throw new Error("Could not load more artwork. Try again.");
      setPosts((previous) => [
        ...previous,
        ...data.filter((item) => !previous.some((old) => old.id === item.id)),
      ]);
      setHasMore(data.length === pageSize);
    });
  }

  const configured = ready && supabase;
  return (
    <div className={s.root}>
      <a href="#community-content" className={s.skip}>
        Skip to community
      </a>
      <header className={s.header}>
        <a href="/hub" className={s.logo}>
          DOSE Art<span> / COMMUNITY</span>
        </a>
        <nav aria-label="Community navigation">
          <a href="/hub">Main home</a><a href="/suggestions">Suggest an idea →</a>
          <button disabled={!configured || busy} onClick={() => go("feed")}>
            Discover
          </button>
          <button
            disabled={!configured || busy}
            onClick={() =>
              user && myProfile
                ? go("gallery", myProfile)
                : requireUser("profile")
            }
          >
            My studio
          </button>
          {user && <button disabled={busy || !myProfile} onClick={() => go("profile")}>Edit profile</button>}
          {user ? (
            <button
              disabled={busy}
              onClick={() =>
                perform(async () => {
                  const { error } = await supabase.auth.signOut();
                  if (error)
                    throw new Error("Sign-out failed. Please try again.");
                  setUser(null);
                  setMyProfile(null);
                  go("feed");
                })
              }
            >
              Sign out
            </button>
          ) : (
            <button
              disabled={!configured || busy}
              onClick={() => {
                go("auth");
                setAuthMode("signin");
              }}
            >
              Sign in
            </button>
          )}
          <button
            className={s.primary}
            disabled={!configured || busy}
            onClick={() => requireUser("post")}
          >
            Share artwork +
          </button>
        </nav>
      </header>
      <main id="community-content" className={s.main}>
        <div className={s.intro}>
          <p className={s.eyebrow}>STREET ROOTS. EVERY STYLE WELCOME.</p>
          <h1>
            MAKE YOUR
            <br />
            MARK<span>.</span>
          </h1>
          <p>From blackbooks to big walls. Art is the beginning, not the limit.</p>
        </div>
        {!ready && <p role="status">Opening the studio…</p>}
        {ready && !supabase && (
          <section className={s.setup}>
            <span className={s.eyebrow}>
              DOSE ART / BACKEND SETUP PENDING
            </span>
            <h2>The next chapter is taking shape.</h2>
            <p>
              The preview backend is connected, but database and email setup still need to be completed and verified. Accounts, profile edits, and uploads stay unavailable until then—not simulated.
            </p>
            <ol>
              <li>
                The dedicated Supabase Free resource is connected to Preview only.
              </li>
              <li>
                Connect the preview database and apply the included
                access-control migration.
              </li>
              <li>
                Configure confirmation-email redirects and test with two artist
                accounts.
              </li>
            </ol>
            <a className={s.linkButton} href="/art-preview">
              Explore the interactive design demo →
            </a>
            <p className={s.small}>
              The demo uses fictional artists and resets on reload. No personal
              details or artwork are collected here while setup is pending.
            </p>
          </section>
        )}
        <p role="alert" className={error ? s.error : s.srOnly}>
          {error}
        </p>
        <p role="status" className={message ? s.message : s.srOnly}>
          {message}
        </p>
        {configured && (
          <>
            {view === "auth" && (
              <section className={s.panel}>
                <h2>
                  {authMode === "signup"
                    ? "Create your DOSE Art account."
                    : authMode === "reset"
                      ? "Find your way back."
                      : authMode === "newpassword"
                        ? "Choose a new password."
                        : "Welcome back to DOSE Art."}
                </h2>
                <p className={s.small}>
                  Your profile, artwork, and captions will be public. Your email
                  is not part of your public profile.
                </p>
                <form onSubmit={authenticate} key={authMode}>
                  <fieldset disabled={busy}>
                    {authMode !== "newpassword" && (
                      <label>
                        Email
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                        />
                      </label>
                    )}
                    {authMode !== "reset" && (
                      <label>
                        Password
                        <input
                          type="password"
                          name="password"
                          autoComplete={
                            authMode === "signin"
                              ? "current-password"
                              : "new-password"
                          }
                          required
                          minLength={12}
                          maxLength={128}
                        />
                        <small>At least 12 characters.</small>
                      </label>
                    )}
                    <button className={s.primary} type="submit">
                      {busy
                        ? "Please wait…"
                        : authMode === "signup"
                          ? "Create account"
                          : authMode === "reset"
                            ? "Send reset email"
                            : authMode === "newpassword"
                              ? "Update password"
                              : "Sign in"}
                    </button>
                  </fieldset>
                </form>
                <div className={s.inline}>
                  {["signin", "signup", "reset"]
                    .filter((mode) => mode !== authMode)
                    .map((mode) => (
                      <button
                        disabled={busy}
                        key={mode}
                        onClick={() => {
                          setAuthMode(mode);
                          setError("");
                          setMessage("");
                        }}
                      >
                        {mode === "signin"
                          ? "Sign in"
                          : mode === "signup"
                            ? "Create an account"
                            : "Forgot password?"}
                      </button>
                    ))}
                </div>
              </section>
            )}
            {view === "profile" && user && (
              <section className={s.panel}>
                <h2>Make your studio yours.</h2>
                {!myProfile ? (
                  <p>
                    Loading your profile…{" "}
                    <button
                      disabled={busy}
                      onClick={() => setRefresh((n) => n + 1)}
                    >
                      Retry
                    </button>
                  </p>
                ) : (
                  <form key={myProfile.id} onSubmit={saveProfile}>
                    <fieldset disabled={busy}>
                      <label>
                        Artist name
                        <input
                          name="display_name"
                          defaultValue={myProfile.display_name}
                          maxLength={80}
                          required
                        />
                      </label>
                      <label>
                        Username
                        <input
                          name="username"
                          defaultValue={myProfile.username}
                          pattern="[a-z0-9_]{3,40}"
                          minLength={3}
                          maxLength={40}
                          required
                          autoCapitalize="none"
                        />
                        <small>
                          3–40 lowercase letters, numbers, or underscores.
                        </small>
                      </label>
                      <label>
                        Medium or creative practice
                        <input
                          name="medium"
                          defaultValue={myProfile.medium}
                          maxLength={80}
                        />
                      </label>
                      <label>
                        A little about you
                        <textarea
                          name="bio"
                          defaultValue={myProfile.bio}
                          maxLength={1000}
                          rows={4}
                        />
                      </label>
                      <label>
                        Avatar (optional)
                        <input
                          type="file"
                          name="avatar"
                          accept="image/jpeg,image/png,image/webp"
                        />
                        <small>
                          JPEG, PNG, or WebP · up to 5 MB · publicly visible.
                        </small>
                      </label>
                      <button className={s.primary} type="submit">
                        {busy ? "Saving…" : "Save artist profile"}
                      </button>
                    </fieldset>
                  </form>
                )}
              </section>
            )}
            {view === "post" && user && (
              <section className={s.panel}>
                <h2>Share what you make.</h2>
                <p className={s.small}>
                  Posts and uploaded images are public, including to signed-out
                  visitors. Do not upload private, sensitive, or unlicensed
                  work. Remove location metadata before sharing.
                </p>
                <form onSubmit={publish}>
                  <fieldset disabled={busy || !myProfile}>
                    <label>
                      Artwork image
                      <input
                        type="file"
                        name="artwork"
                        accept="image/jpeg,image/png,image/webp"
                        required
                      />
                      <small>
                        JPEG, PNG, or WebP · up to 5 MB · 40 megapixels max.
                      </small>
                    </label>
                    <label>
                      Title
                      <input name="title" maxLength={100} required />
                    </label>
                    <label>
                      Tell the story
                      <textarea name="caption" rows={4} maxLength={2000} />
                    </label>
                    <label>
                      Medium
                      <select name="medium">
                        {mediums.map((medium) => (
                          <option key={medium}>{medium}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Describe the image for screen readers
                      <textarea
                        name="alt_text"
                        rows={2}
                        maxLength={500}
                        required
                      />
                    </label>
                    <label className={s.checkbox}>
                      <input type="checkbox" name="show_in_feed" defaultChecked disabled={!feedChoiceReady} />
                      <span>Show on DOSE Art’s main feed<small style={{ display: "block" }}>Uncheck to show this artwork only on your artist profile. Profile-only posts and image URLs are still public, not private.</small></span>
                    </label>
                    {!feedChoiceReady && <p className={s.small}>The feed choice needs the site owner’s database update, or a connection retry. Until available, posts appear on both your profile and the main feed, as before.</p>}
                    <label className={s.checkbox}>
                      <input type="checkbox" name="rights" required />I made
                      this artwork or have permission to publish it, and
                      understand it will be public.
                    </label>
                    <button className={s.primary} type="submit">
                      {busy ? "Publishing…" : "Publish artwork"}
                    </button>
                  </fieldset>
                </form>
                {!myProfile && (
                  <p>
                    Waiting for your artist profile.{" "}
                    <button onClick={() => requireUser("profile")}>
                      Open profile
                    </button>
                  </p>
                )}
              </section>
            )}
            {["feed", "gallery"].includes(view) && (
              <>
                {artist && (
                  <section className={s.artist}>
                    <Avatar profile={artist} supabase={supabase} />
                    <div>
                      <p className={s.eyebrow}>ARTIST STUDIO</p>
                      <h2>{artist.display_name}</h2>
                      <p>
                        @{artist.username} · {artist.medium || "Exploring"}
                      </p>
                      <p className={s.bio}>
                        {artist.bio || "Every artist starts somewhere."}
                      </p>
                    </div>
                    {user?.id === artist.id && (
                      <button
                        disabled={busy}
                        className={s.secondary}
                        onClick={() => go("profile")}
                      >
                        Edit profile
                      </button>
                    )}
                  </section>
                )}
                <div className={s.sectionTitle}>
                  <h2>
                    {artist ? "From the studio" : "Fresh from the community"}
                  </h2>
                  <button
                    disabled={loading || busy}
                    onClick={() => {
                      setError("");
                      setRefresh((n) => n + 1);
                    }}
                  >
                    Refresh ↻
                  </button>
                </div>
                {loading ? (
                  <p role="status">Gathering a little inspiration…</p>
                ) : !posts.length ? (
                  <section className={s.empty}>
                    <h3>
                      {error
                        ? "The gallery is unavailable."
                        : artist
                          ? "A fresh canvas."
                          : "Be here at the beginning."}
                    </h3>
                    <p>
                      {error
                        ? "Please retry after the database connection is ready."
                        : "No artwork yet. The first real posts will appear here—no fictional accounts mixed in."}
                    </p>
                    <button
                      className={s.primary}
                      disabled={busy}
                      onClick={() => requireUser("post")}
                    >
                      Share your first artwork
                    </button>
                  </section>
                ) : (
                  <div className={s.grid}>
                    {posts.map((post) => (
                      <article key={post.id} className={s.post}>
                        <button
                          className={s.postArtist}
                          disabled={busy}
                          onClick={() =>
                            perform(async () => {
                              const { data, error } = await supabase
                                .from("profiles")
                                .select("*")
                                .eq("id", post.artist_id)
                                .single();
                              if (error)
                                throw new Error(
                                  "Artist profile is unavailable.",
                                );
                              go("gallery", data);
                            })
                          }
                        >
                          <Avatar profile={post.profiles} supabase={supabase} />
                          <span>
                            <strong>
                              {post.profiles?.display_name || "Artist"}
                            </strong>
                            <small>
                              @{post.profiles?.username || "artist"}
                            </small>
                          </span>
                          <span className={s.tag}>{post.medium}</span>
                        </button>
                        <img
                          className={s.artwork}
                          src={mediaUrl(
                            supabase,
                            "dose-artwork",
                            post.image_path,
                          )}
                          alt={post.alt_text}
                          width="800"
                          height="600"
                          loading="lazy"
                        />
                        <div className={s.postCopy}>
                          <h3>{post.title}</h3>
                          <p>{post.caption}</p>
                          <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString(
                              "en",
                              { dateStyle: "medium", timeZone: "UTC" },
                            )}
                          </time>
                          {user?.id === post.artist_id && (
                            <div className={s.delete}>
                              {deleting === post.id ? (
                                <>
                                  <p>
                                    Delete this post and its public image? This
                                    cannot be undone.
                                  </p>
                                  <button
                                    disabled={busy}
                                    onClick={() => removePost(post)}
                                  >
                                    Yes, delete
                                  </button>
                                  <button
                                    disabled={busy}
                                    onClick={() => setDeleting(null)}
                                  >
                                    Keep artwork
                                  </button>
                                </>
                              ) : (
                                <button
                                  disabled={busy}
                                  onClick={() => setDeleting(post.id)}
                                >
                                  Delete my post
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {hasMore && (
                  <button
                    className={s.secondary}
                    disabled={busy}
                    onClick={loadMore}
                  >
                    {busy ? "Loading…" : "Load more artwork"}
                  </button>
                )}
              </>
            )}
            <p className={s.footer}>
              Private preview foundation · Respect the artist. Credit the
              inspiration.
              <br />
              Follows, likes, comments, moderation, and account deletion are not
              part of this first backend release. Keep this invite-only until
              community safeguards are ready.
            </p>
          </>
        )}
      </main>
      <footer className={s.bottom}>
        <a href="/art-preview">Design demo</a>
        <a href="/collection">The Secret Nine</a>
        <a href="/intro">The DOSE experience</a>
      </footer>
    </div>
  );
}
