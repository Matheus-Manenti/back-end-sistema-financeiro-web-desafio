-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('ADIMPLENTE', 'INADIMPLENTE');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "financialStatus" "FinancialStatus" NOT NULL DEFAULT 'ADIMPLENTE';
