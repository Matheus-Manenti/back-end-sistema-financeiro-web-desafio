/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentDate",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION;

-- DropEnum
DROP TYPE "ClientStatus";
