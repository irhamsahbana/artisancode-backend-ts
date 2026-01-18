/*
  Warnings:

  - The `status` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('active', 'inactive', 'graduated', 'suspended', 'dropped', 'pending');

-- AlterTable
ALTER TABLE "students" DROP COLUMN "status",
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");
