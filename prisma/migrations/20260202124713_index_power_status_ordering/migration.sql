-- DropIndex
DROP INDEX "PowerStatus_businessId_idx";

-- CreateIndex
CREATE INDEX "PowerStatus_businessId_updatedAt_idx" ON "PowerStatus"("businessId", "updatedAt");
