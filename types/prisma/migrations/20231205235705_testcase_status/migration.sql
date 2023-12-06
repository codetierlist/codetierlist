/*
  Warnings:

  - The `valid` column on the `Testcases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('INVALID', 'VALID', 'PENDING');

-- AlterTable
ALTER TABLE "Testcases" DROP COLUMN "valid",
ADD COLUMN     "valid" "TestCaseStatus" NOT NULL DEFAULT 'PENDING';
