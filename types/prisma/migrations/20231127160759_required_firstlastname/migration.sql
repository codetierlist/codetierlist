/*
  Warnings:

  - Made the column `givenName` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surname` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "givenName" SET NOT NULL,
ALTER COLUMN "surname" SET NOT NULL;
