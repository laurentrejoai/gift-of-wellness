"use client";

import { useEffect, useState } from "react";

// Central time: opens Tue Dec 8 12:00 AM, closes Wed Dec 16 11:59 PM
const OPENS = Date.parse("2026-12-08T06:00:00Z");
const CLOSES = Date.parse("2026-12-17T06:00:00Z");
const MAX_STORY = 1500;

const SPARKLES = [
  { top: 18, left: "8%", s: 16 }, { top: 60, left: "88%", s: 12 },
  { top: 150, left: "4%", s: 10 }, { top: 190, left: "93%", s: 16 }, { top: 110, left: "80%", s: 9 },
];

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
    <main className="wrap">
      <div className="sparkles" aria-hidden="true">
        {SPARKLES.map((p, i) => (
          <span key={i} style={{ top: p.top, left: p.left, fontSize: p.s }}>✦</span>
        ))}
      </div>

      <img className="logo" src="/logo.png" alt="Abundant Life Wellness Center" />
      <p className="eyebrow">A Christmas giveaway</p>
      <h1>Give the Gift <br />of <em>Wellness</em></h1>

      {status === "done" ? (
        <div className="card done">
          <div className="big">🤍</div>
          <h2 style={{ border: 0, marginTop: 6 }}>Thank you for your nomination.</h2>
          <p>Our team will read every story. If your nominee is chosen, we'll reach out to you first to help plan the surprise.</p>
          <div className="heart">
            One more thing: head back to our post and <b>comment a 🤍</b> so we know you nominated someone.
          </div>
        </div>
      ) : (
        <>
          <p className="lede">
            Know someone who deserves a little care this Christmas? A mom who never stops, a caregiver,
            a teacher, a nurse. Tell us about them, and our team will pick one person to surprise.
          </p>

          <div className="card prize">
            <div className="gift" aria-hidden="true">🎁</div>
            <div>
              <div className="label">The gift</div>
              <div className="name">A Restorative Wellness Facial with Rachel</div>
            </div>
          </div>

          <div className="dates">
            <div className="date"><b>Dec 8</b><small>Nominations open</small></div>
            <div className="date"><b>Dec 16</b><small>Nominations close</small></div>
            <div className="date"><b>Dec 21</b><small>Winner revealed</small></div>
          </div>

          {phase === "soon" && (
            <div className="card done">
              <p style={{ margin: 0 }}>Nominations open <b>Tuesday, December 8</b>. Check back then.</p>
            </div>
          )}

          {phase === "closed" && (
            <div className="card done">
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
        Abundant Life Wellness Center · <a href="tel:8173793770">817-379-3770</a>
      </footer>
    </main>
  );
}
