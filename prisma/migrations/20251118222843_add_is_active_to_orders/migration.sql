/*
  Warnings:

  - You are about to drop the column `paidAt` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paidAt",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
