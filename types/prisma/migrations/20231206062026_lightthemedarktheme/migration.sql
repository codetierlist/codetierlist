-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'LIGHT';
