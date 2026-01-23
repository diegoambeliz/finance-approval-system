import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Users
  const requester = await prisma.user.upsert({
    where: { email: "requester@demo.com" },
    update: {},
    create: {
      id: "user_requester",
      email: "requester@demo.com",
      name: "Demo Requester",
      roles: ["REQUESTER"],
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      id: "user_manager",
      email: "manager@demo.com",
      name: "Demo Manager",
      roles: ["MANAGER"],
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: "finance@demo.com" },
    update: {},
    create: {
      id: "user_finance",
      email: "finance@demo.com",
      name: "Demo Finance",
      roles: ["FINANCE"],
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      id: "user_admin",
      email: "admin@demo.com",
      name: "Demo Admin",
      roles: ["ADMIN", "MANAGER"],
    },
  });

  // Sample request
  await prisma.financeRequest.create({
    data: {
      createdById: requester.id,
      status: "WAITING_FOR_MANAGER",
      type: "PURCHASE",
      title: "New MacBook Pro",
      amount: 2400,
      reason: "Replacement laptop required for development work and performance needs.",
      vendor: "Apple",
      costCenter: "Engineering",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
