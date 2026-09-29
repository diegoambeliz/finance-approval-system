// One-off empirical check for Phase 7 Step 3 (not part of the npm workflow,
// like verify-db-isolation.mjs). Fires two concurrent "manager decision"
// transactions at the SAME WAITING_FOR_MANAGER request, using the exact
// updateMany-with-status-guard pattern now in
// app/api/requests/[id]/decision/route.ts, and proves that exactly one
// commits while the other is cleanly rejected - against the real isolated
// test database, not a mock.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.test", override: true });

const dbName = new URL(process.env.DATABASE_URL).pathname.replace(/^\//, "");
if (!dbName.endsWith("_test")) {
  throw new Error(`Refusing to run against "${dbName}" - not a test database.`);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const managerId = "user_concurrency_check_manager";
const requesterId = "user_concurrency_check_requester";
const requestId = "req_concurrency_check";

async function cleanup() {
  await prisma.decision.deleteMany({ where: { requestId } });
  await prisma.financeRequest.deleteMany({ where: { id: requestId } });
  await prisma.user.deleteMany({ where: { id: { in: [managerId, requesterId] } } });
}

async function attemptManagerApprove(label) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const { count } = await tx.financeRequest.updateMany({
        where: { id: requestId, status: "WAITING_FOR_MANAGER" },
        data: { status: "WAITING_FOR_FINANCE" },
      });

      if (count === 0) {
        throw new Error("CONFLICT: already decided");
      }

      await tx.decision.create({
        data: { requestId, step: "MANAGER", action: "APPROVE", decidedById: managerId },
      });

      return "committed";
    });
    console.log(`${label}: ${result}`);
  } catch (err) {
    console.log(`${label}: rejected (${err.message})`);
  }
}

await cleanup();

await prisma.user.create({
  data: { id: requesterId, email: "concurrency-requester@test.local", name: "Requester", roles: ["REQUESTER"] },
});
await prisma.user.create({
  data: { id: managerId, email: "concurrency-manager@test.local", name: "Manager", roles: ["MANAGER"] },
});
await prisma.financeRequest.create({
  data: {
    id: requestId,
    createdById: requesterId,
    status: "WAITING_FOR_MANAGER",
    type: "PURCHASE",
    title: "Concurrency check",
    amount: 100,
    reason: "Verifying the atomic status guard.",
    vendor: "Acme",
    costCenter: "Eng",
  },
});

console.log("Firing two concurrent manager-approve attempts at the same request...");
await Promise.all([attemptManagerApprove("Manager A"), attemptManagerApprove("Manager B")]);

const finalRequest = await prisma.financeRequest.findUniqueOrThrow({ where: { id: requestId } });
const decisionCount = await prisma.decision.count({ where: { requestId } });

console.log(`\nFinal status: ${finalRequest.status}`);
console.log(`Decision rows created: ${decisionCount}`);
console.log(
  finalRequest.status === "WAITING_FOR_FINANCE" && decisionCount === 1
    ? "PASS: exactly one approval won, exactly one Decision recorded."
    : "FAIL: race was not prevented."
);

await cleanup();
await prisma.$disconnect();
