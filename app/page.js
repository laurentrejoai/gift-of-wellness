"use client";

import { useEffect, useState } from "react";

// Central time: opens Tue Dec 8 12:00 AM, closes Wed Dec 16 11:59 PM
const OPENS = Date.parse("2026-12-08T06:00:00Z");
const CLOSES = Date.parse("2026-12-17T06:00:00Z");
const MAX_STORY = 1500;

const SNOW = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 8 + ((i * 7) % 10),
  dur: 9 + ((i * 5) % 9),
  delay: -((i * 3.1) % 14),
}));

export default function Page() {
  const [phase, setPhase] = useState("open");
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    nomineeName: "", relationship: "", story: "",
    nominatorName: "", nominatorEmail: "", nominatorPhone: "",
    helpSurprise: true, website: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).has("preview");
    setPreview(p);
    const now = Date.now();
    if (!p && now < OPENS) setPhase("soon");
    else if (!p && now >= CLOSES) setPhase("closed");
    else setPhase("open");
  }, []);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.nominatorEmail && !form.nominatorPhone) {
      setError("Please leave an email or phone number so we can reach you.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/nominate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preview }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <>
    <header className="hero">
      <div className="snow" aria-hidden="true">
        {SNOW.map((f, i) => (
          <span key={i} style={{ left: f.left + "%", fontSize: f.size, animationDuration: f.dur + "s", animationDelay: f.delay + "s" }}>❄</span>
        ))}
      </div>
      <div className="hero-inner">
        <div className="garland" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
        <img className="logo" src="/logo-light.png" alt="Abundant Life Wellness Center" />
        <p className="eyebrow">A Christmas giveaway</p>
        <h1>Give the Gift <br />of <em>Wellness</em></h1>
        {status !== "done" && (
          <p className="lede">
            Know someone who deserves a little care this Christmas? A mom who never stops, a caregiver,
            a teacher, a nurse. Tell us about them, and our team will pick one person to surprise.
          </p>
        )}
      </div>
    </header>

    <main className="wrap">
      {status === "done" ? (
        <div className="tag done">
          <div className="big">🤍</div>
          <h2 style={{ border: 0, marginTop: 6 }}>Thank you for your nomination.</h2>
          <p>Our team will read every story. If your nominee is chosen, we'll reach out to you first to help plan the surprise.</p>
          <div className="heart">
            One more thing: head back to our post and <b>comment a 🤍</b> so we know you nominated someone.
          </div>
        </div>
      ) : (
        <>


          <div className="tag">
            <span className="bow" aria-hidden="true">🎀</span>
            <div className="tag-body">
              <div className="label">The gift</div>
              <div className="name">A Restorative Wellness Facial with Rachel</div>
            </div>
          </div>

          <div className="dates">
            <div className="date"><b>Dec 8</b><small>Nominations open</small></div>
            <div className="date"><b>Dec 16</b><small>Nominations close</small></div>
            <div className="date reveal"><b>Dec 21</b><small>Winner revealed</small></div>
          </div>

          {phase === "soon" && (
            <div className="tag notice">
              <p style={{ margin: 0 }}>Nominations open <b>Tuesday, December 8</b>. Check back then.</p>
            </div>
          )}

          {phase === "closed" && (
            <div className="tag notice">
              <p style={{ margin: 0 }}>Nominations are closed. Thank you to everyone who shared a story. Watch for the winner reveal on <b>December 21</b>.</p>
            </div>
          )}

          {phase === "open" && (
            <form onSubmit={submit} noValidate={false}>
              <h2>Who are you nominating?</h2>
              <p className="sub">Only our team sees what you write here.</p>

              <label htmlFor="nomineeName">Their name</label>
              <input id="nomineeName" type="text" required maxLength={120} value={form.nomineeName} onChange={set("nomineeName")} />

              <label htmlFor="relationship">How do you know them? <span className="opt">(my sister, my coworker…)</span></label>
              <input id="relationship" type="text" required maxLength={120} value={form.relationship} onChange={set("relationship")} />

              <label htmlFor="story">Why do they deserve a little care this Christmas?</label>
              <textarea id="story" required maxLength={MAX_STORY} value={form.story} onChange={set("story")} />
              <div className="count">{form.story.length}/{MAX_STORY}</div>

              <h2>About you</h2>
              <p className="sub">If your nominee is chosen, we'll contact you first so we can plan the surprise together.</p>

              <label htmlFor="nominatorName">Your name</label>
              <input id="nominatorName" type="text" required maxLength={120} value={form.nominatorName} onChange={set("nominatorName")} />

              <label htmlFor="nominatorEmail">Email</label>
              <input id="nominatorEmail" type="email" maxLength={200} value={form.nominatorEmail} onChange={set("nominatorEmail")} />

              <label htmlFor="nominatorPhone">Phone <span className="opt">(email or phone is fine)</span></label>
              <input id="nominatorPhone" type="tel" maxLength={40} value={form.nominatorPhone} onChange={set("nominatorPhone")} />

              <label className="check">
                <input type="checkbox" checked={form.helpSurprise} onChange={set("helpSurprise")} />
                <span>If they're chosen, I'd love to help plan the surprise.</span>
              </label>

              <div className="hp" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
              </div>

              <button className="btn" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send my nomination"}
              </button>
              {error && <p className="err">{error}</p>}
              <p className="fine">You can nominate more than one person. Send one form for each.</p>

              <div className="heart">
                After you nominate, <b>comment a 🤍 on our post</b> so we know you did.
              </div>
            </form>
          )}
        </>
      )}

      <footer>
        <span className="sprig" aria-hidden="true">🌲 ✦ 🌲</span>
        Abundant Life Wellness Center · <a href="tel:8173793770">817-379-3770</a>
      </footer>
    </main>
    </>
  );
}
