-- CreateIndex
CREATE UNIQUE INDEX "Decision_requestId_step_key" ON "Decision"("requestId", "step");

-- CreateIndex
CREATE INDEX "FinanceRequest_createdById_idx" ON "FinanceRequest"("createdById");

-- CreateIndex
CREATE INDEX "FinanceRequest_status_idx" ON "FinanceRequest"("status");
