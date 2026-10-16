// One-time helper to promote the first demo/admin account to ADMIN.
//
// The Clerk webhook always syncs new signups in as REQUESTER (see
// app/api/webhooks/clerk/route.ts) - there is no way to become ADMIN through
// the product itself until at least one ADMIN already exists to grant roles
// via /admin/users. This script breaks that bootstrap deadlock exactly once.
//
// Usage:
//   node scripts/bootstrap-admin.mjs <email>
//
// Uses DATABASE_URL from the environment if set, otherwise falls back to
// .env. To target production, run with the prod URL inline instead of
// editing any file:
//   DATABASE_URL="postgresql://...prod..." node scripts/bootstrap-admin.mjs you+admin@example.com
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/bootstrap-admin.mjs <email>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (checked the environment and .env).");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(
      `No user found with email "${email}". Sign up through the app first (Clerk webhook has to sync the account in) before running this.`
    );
    process.exit(1);
  }

  if (user.roles.includes("ADMIN")) {
    console.log(`"${email}" is already ADMIN. Nothing to do.`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { roles: { set: [...user.roles, "ADMIN"] } },
    select: { id: true, email: true, roles: true },
  });

  console.log(`Promoted "${updated.email}" to ADMIN. Roles: ${updated.roles.join(", ")}`);
  console.log("Use /admin/users from here on to grant any other roles.");
} finally {
  await prisma.$disconnect();
}
