-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'MANAGER', 'FINANCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'WAITING_FOR_MANAGER', 'WAITING_FOR_FINANCE', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('PURCHASE', 'REIMBURSEMENT', 'SUBSCRIPTION', 'INVOICE_PAYMENT');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roles" "Role"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceRequest" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "type" "RequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "vendor" TEXT,
    "costCenter" TEXT,
    "expenseDate" TIMESTAMP(3),
    "billingCycle" "BillingCycle",
    "invoiceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "step" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "decidedById" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "FinanceRequest" ADD CONSTRAINT "FinanceRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FinanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
