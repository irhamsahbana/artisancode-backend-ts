/*
  Warnings:

  - You are about to drop the column `isActive` on the `product_prices` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_prices_product_pricing_id_started_at_ended_at_isAct_idx";

-- AlterTable
ALTER TABLE "product_prices" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "product_prices_product_pricing_id_started_at_ended_at_idx" ON "product_prices"("product_pricing_id", "started_at", "ended_at");
