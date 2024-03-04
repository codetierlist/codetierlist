/*
  Warnings:

  - Added the required column `session` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Session" AS ENUM ('FALL', 'WINTER', 'SUMMER');

-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "session" "Session" NOT NULL default 'WINTER'::"Session";
