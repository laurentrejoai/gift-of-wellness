import { Pool } from "pg";

let pool;
let ready;

export function getPool() {
  if (!pool) {
    const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
    // Supabase poolers use their own certificate; keep TLS on, skip CA pinning.
    const url = raw.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 2 });
  }
  return pool;
}

export async function ensureTable(db) {
  if (!ready) {
    ready = db
      .query(`
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
        )`)
      .catch((e) => {
        ready = undefined;
        throw e;
      });
  }
  return ready;
}
