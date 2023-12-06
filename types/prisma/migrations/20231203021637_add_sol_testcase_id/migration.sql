/*
  Warnings:

  - The primary key for the `Solutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Testcases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[_id]` on the table `Solutions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,assignment_title,author_id,git_id]` on the table `Solutions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[_id]` on the table `Testcases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,assignment_title,author_id,git_id]` on the table `Testcases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `solution_commit_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testcase_commit_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_fkey";

-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_fkey";

-- DropIndex
DROP INDEX "Solutions_course_id_assignment_title_author_id_key";

-- DropIndex
DROP INDEX "Testcases_course_id_assignment_title_author_id_key";

-- AlterTable
ALTER TABLE "Solutions" DROP CONSTRAINT "Solutions_pkey",
ADD COLUMN     "_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Solutions_pkey" PRIMARY KEY ("course_id", "assignment_title", "author_id", "git_id");

-- AlterTable
ALTER TABLE "Testcases" DROP CONSTRAINT "Testcases_pkey",
ADD COLUMN     "_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Testcases_pkey" PRIMARY KEY ("course_id", "assignment_title", "author_id", "git_id");

-- AlterTable
ALTER TABLE "_Scores" ADD COLUMN     "solution_commit_id" TEXT NOT NULL,
ADD COLUMN     "testcase_commit_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Solutions__id_key" ON "Solutions"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Solutions_course_id_assignment_title_author_id_git_id_key" ON "Solutions"("course_id", "assignment_title", "author_id", "git_id");

-- CreateIndex
CREATE UNIQUE INDEX "Testcases__id_key" ON "Testcases"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Testcases_course_id_assignment_title_author_id_git_id_key" ON "Testcases"("course_id", "assignment_title", "author_id", "git_id");

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_solu_fkey" FOREIGN KEY ("course_id", "assignment_title", "solution_author_id", "solution_commit_id") REFERENCES "Solutions"("course_id", "assignment_title", "author_id", "git_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_test_fkey" FOREIGN KEY ("course_id", "assignment_title", "testcase_author_id", "testcase_commit_id") REFERENCES "Testcases"("course_id", "assignment_title", "author_id", "git_id") ON DELETE CASCADE ON UPDATE CASCADE;
