/*
  Warnings:

  - The primary key for the `Solutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `Solutions` table. All the data in the column will be lost.
  - You are about to drop the column `_id` on the `Testcases` table. All the data in the column will be lost.
  - You are about to drop the column `solution_commit_id` on the `_Scores` table. All the data in the column will be lost.
  - You are about to drop the column `testcase_commit_id` on the `_Scores` table. All the data in the column will be lost.
  - Added the required column `solution_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testcase_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_solu_fkey";

-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_test_fkey";

-- DropIndex
DROP INDEX "Solutions__id_key";

-- DropIndex
DROP INDEX "Testcases__id_key";

-- AlterTable
ALTER TABLE "Solutions" DROP CONSTRAINT "Solutions_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Solutions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Testcases" DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Testcases_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_Scores" DROP COLUMN "solution_commit_id",
DROP COLUMN "testcase_commit_id",
ADD COLUMN     "solution_id" TEXT NOT NULL,
ADD COLUMN     "testcase_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "solution_index" ON "Solutions"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE INDEX "datetime_index" ON "Solutions"("datetime" DESC);

-- CreateIndex
CREATE INDEX "author_index" ON "Solutions"("author_id");

-- CreateIndex
CREATE INDEX "author_datetime_index" ON "Solutions"("author_id", "datetime" DESC);

-- CreateIndex
CREATE INDEX "testcase_index" ON "Testcases"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE INDEX "testcase_datetime_index" ON "Testcases"("datetime" DESC);

-- CreateIndex
CREATE INDEX "testcase_author_index" ON "Testcases"("author_id");

-- CreateIndex
CREATE INDEX "testcase_author_datetime_index" ON "Testcases"("author_id", "datetime" DESC);

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "Solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_testcase_id_fkey" FOREIGN KEY ("testcase_id") REFERENCES "Testcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
