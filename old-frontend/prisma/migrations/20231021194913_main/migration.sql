/*
  Warnings:

  - The primary key for the `Assignments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Assignments` table. All the data in the column will be lost.
  - The primary key for the `Solutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Solutions` table. All the data in the column will be lost.
  - The primary key for the `_Roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `_Roles` table. All the data in the column will be lost.
  - You are about to drop the column `solution_id` on the `_Scores` table. All the data in the column will be lost.
  - You are about to drop the column `test_id` on the `_Scores` table. All the data in the column will be lost.
  - You are about to drop the `TestCases` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[course_id,title]` on the table `Assignments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,assignment_title,author_id]` on the table `Solutions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,course_id]` on the table `_Roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignment_title` to the `Solutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `Solutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignment_title` to the `_Scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solution_author_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testcase_author_id` to the `_Scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TestCases" DROP CONSTRAINT "TestCases_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_solution_id_fkey";

-- DropForeignKey
ALTER TABLE "_Scores" DROP CONSTRAINT "_Scores_test_id_fkey";

-- AlterTable
ALTER TABLE "Assignments" DROP CONSTRAINT "Assignments_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Assignments_pkey" PRIMARY KEY ("course_id", "title");

-- AlterTable
ALTER TABLE "Solutions" DROP CONSTRAINT "Solutions_pkey",
DROP COLUMN "id",
ADD COLUMN     "assignment_title" TEXT NOT NULL,
ADD COLUMN     "course_id" TEXT NOT NULL,
ADD CONSTRAINT "Solutions_pkey" PRIMARY KEY ("course_id", "assignment_title", "author_id");

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_Roles" DROP CONSTRAINT "_Roles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "_Roles_pkey" PRIMARY KEY ("user_id", "course_id");

-- AlterTable
ALTER TABLE "_Scores" DROP COLUMN "solution_id",
DROP COLUMN "test_id",
ADD COLUMN     "assignment_title" TEXT NOT NULL,
ADD COLUMN     "course_id" TEXT NOT NULL,
ADD COLUMN     "solution_author_id" TEXT NOT NULL,
ADD COLUMN     "testcase_author_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "TestCases";

-- CreateTable
CREATE TABLE "Testcases" (
    "git_url" TEXT NOT NULL,
    "git_id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,

    CONSTRAINT "Testcases_pkey" PRIMARY KEY ("course_id","assignment_title","author_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Testcases_course_id_assignment_title_author_id_key" ON "Testcases"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "Assignments_course_id_title_key" ON "Assignments"("course_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Solutions_course_id_assignment_title_author_id_key" ON "Solutions"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "_Roles_user_id_course_id_key" ON "_Roles"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_course_id_assignment_title_fkey" FOREIGN KEY ("course_id", "assignment_title") REFERENCES "Assignments"("course_id", "title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_course_id_assignment_title_fkey" FOREIGN KEY ("course_id", "assignment_title") REFERENCES "Assignments"("course_id", "title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_fkey" FOREIGN KEY ("course_id", "assignment_title", "solution_author_id") REFERENCES "Solutions"("course_id", "assignment_title", "author_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_fkey" FOREIGN KEY ("course_id", "assignment_title", "testcase_author_id") REFERENCES "Testcases"("course_id", "assignment_title", "author_id") ON DELETE CASCADE ON UPDATE CASCADE;
