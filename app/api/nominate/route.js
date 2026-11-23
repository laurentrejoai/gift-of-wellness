export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Central time: opens Tue Dec 8 12:00 AM, closes Wed Dec 16 11:59 PM
const OPENS = Date.parse("2026-12-08T06:00:00Z");
const CLOSES = Date.parse("2026-12-17T06:00:00Z");

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Please try again." }, { status: 400 });
  }

  // Bots fill the hidden field; pretend it worked.
  if (body.website) return Response.json({ ok: true });

  const preview = body.preview === true;
  const now = Date.now();
  if (!preview && (now < OPENS || now >= CLOSES)) {
    return Response.json({ error: "Nominations are open December 8 to 16." }, { status: 403 });
  }

  const row = {
    nominee: clean(body.nomineeName, 120),
    relationship: clean(body.relationship, 120),
    story: clean(body.story, 1500),
    name: clean(body.nominatorName, 120),
    email: clean(body.nominatorEmail, 200),
    phone: clean(body.nominatorPhone, 40),
    help: body.helpSurprise !== false,
    test: preview,
  };

  if (!row.nominee || !row.relationship || !row.story || !row.name) {
    return Response.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (!row.email && !row.phone) {
    return Response.json({ error: "Please leave an email or phone number so we can reach you." }, { status: 400 });
  }

  try {
    const res = await fetch(process.env.SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, key: process.env.SHEET_KEY }),
      redirect: "follow",
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) throw new Error("sheet rejected");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("nomination save failed", err);
    return Response.json({ error: "We couldn't save that. Please try again, or call us at 817-379-3770." }, { status: 500 });
  }
}
