// Runs a command with .env.test's DATABASE_URL in effect, and refuses to run
// at all unless that URL clearly points at a *_test database. This exists so
// a destructive command (migrate reset, etc.) can never silently fall back to
// the dev DATABASE_URL from .env.
import { config } from "dotenv";
import { spawnSync } from "node:child_process";

config({ path: ".env.test", override: true });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set after loading .env.test - run `npm run test:db:up` first.");
  process.exit(1);
}

const dbName = new URL(dbUrl).pathname.replace(/^\//, "");
if (!dbName.endsWith("_test")) {
  console.error(`Refusing to run: resolved database "${dbName}" does not end with "_test".`);
  process.exit(1);
}

console.log(`[with-test-env] DATABASE_URL -> database "${dbName}"`);

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error("Usage: node scripts/with-test-env.mjs <command> [args...]");
  process.exit(1);
}

const result = spawnSync(cmd.join(" "), {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
