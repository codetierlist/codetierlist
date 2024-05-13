/*
  Warnings:

  - Added the required column `run_result` to the `_Scores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "_Scores" ADD COLUMN     "run_result" JSONB NOT NULL;
