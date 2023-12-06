/*
  Warnings:

  - The `theme` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'LIGHT';
