/*
  Warnings:

  - A unique constraint covering the columns `[invoice_number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoice_number` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'quarterly', 'annually', 'one_time');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'pending';
ALTER TYPE "InvoiceStatus" ADD VALUE 'expired';
ALTER TYPE "InvoiceStatus" ADD VALUE 'failed';
ALTER TYPE "InvoiceStatus" ADD VALUE 'cancelled';

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
ADD COLUMN     "next_billing_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'IDR',
ADD COLUMN     "doku_invoice_id" TEXT,
ADD COLUMN     "invoice_number" TEXT NOT NULL,
ADD COLUMN     "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "payment_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
