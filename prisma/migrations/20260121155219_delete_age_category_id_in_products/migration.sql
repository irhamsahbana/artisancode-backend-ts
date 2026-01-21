/*
  Warnings:

  - You are about to drop the column `age_category_id` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_age_category_id_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "age_category_id";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "photo_url" SET DEFAULT '';
