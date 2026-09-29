// One-off verification script for Phase 6 Part 2 Step 1. Not a long-lived
// project script (not wired into package.json) - prints table/row counts for
// the dev DB (.env) and the test DB (.env.test) side by side, to prove they
// are actually different databases rather than the same one under two names.
import { config } from "dotenv";
import pg from "pg";

async function inspect(label, envPath) {
  config({ path: envPath, override: true });
  const dbUrl = process.env.DATABASE_URL;
  const dbName = new URL(dbUrl).pathname.replace(/^\//, "");

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );

  const counts = {};
  for (const { table_name } of tables.rows) {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM "${table_name}"`);
    counts[table_name] = rows[0].count;
  }

  await client.end();
  console.log(`\n${label}: database "${dbName}"`);
  console.log(`  tables: ${tables.rows.map((r) => r.table_name).join(", ") || "(none)"}`);
  console.log(`  row counts: ${JSON.stringify(counts)}`);
  return { dbName, counts };
}

const dev = await inspect("DEV", ".env");
delete process.env.DATABASE_URL;
const test = await inspect("TEST", ".env.test");

console.log(`\nSame database? ${dev.dbName === test.dbName ? "YES (BAD)" : "no (good, isolated)"}`);
