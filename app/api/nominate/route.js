import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENS = Date.parse("2026-12-08T06:00:00Z");
const CLOSES = Date.parse("2026-12-17T06:00:00Z");

let pool;
let ready;

function getPool() {
  if (!pool) {
    const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
    // Supabase poolers use their own certificate; keep TLS on, skip CA pinning.
    const url = raw.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 2 });
  }
  return pool;
}

async function ensureTable(db) {
  if (!ready) {
    ready = db.query(`
      create table if not exists gift_of_wellness_nominations (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        nominee_name text not null,
        relationship text not null,
        story text not null,
        nominator_name text not null,
        nominator_email text,
        nominator_phone text,
        help_with_surprise boolean not null default true,
        is_test boolean not null default false
      )`);
  }
  return ready;
}

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
  };

  if (!row.nominee || !row.relationship || !row.story || !row.name) {
    return Response.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (!row.email && !row.phone) {
    return Response.json({ error: "Please leave an email or phone number so we can reach you." }, { status: 400 });
  }

  try {
    const db = getPool();
    await ensureTable(db);
    await db.query(
      `insert into gift_of_wellness_nominations
        (nominee_name, relationship, story, nominator_name, nominator_email, nominator_phone, help_with_surprise, is_test)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [row.nominee, row.relationship, row.story, row.name, row.email || null, row.phone || null, row.help, preview]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("nomination insert failed", err);
    ready = undefined;
    return Response.json({ error: "We couldn't save that. Please try again, or call us at 817-379-3770." }, { status: 500 });
  }
}
