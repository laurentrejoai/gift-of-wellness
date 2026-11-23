import { getPool, ensureTable } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Used only by the Google Sheet sync script. Needs the secret key.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (!process.env.EXPORT_KEY || body.key !== process.env.EXPORT_KEY) {
    return Response.json({ error: "not allowed" }, { status: 401 });
  }
  const since = Number.isFinite(Number(body.since)) ? Number(body.since) : 0;
  try {
    const db = getPool();
    await ensureTable(db);
    const { rows } = await db.query(
      `select id, created_at, nominee_name, relationship, story, nominator_name,
              nominator_email, nominator_phone, help_with_surprise, is_test
         from gift_of_wellness_nominations where id > $1 order by id limit 500`,
      [since]
    );
    return Response.json({ rows });
  } catch (err) {
    console.error("export failed", err);
    return Response.json({ error: "export failed" }, { status: 500 });
  }
}
