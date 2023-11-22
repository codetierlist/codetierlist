-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INSTRUCTOR', 'TA', 'STUDENT');

-- CreateTable
CREATE TABLE "Assignments" (
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "Assignments_pkey" PRIMARY KEY ("course_id","title")
);

-- CreateTable
CREATE TABLE "Courses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solutions" (
    "git_url" TEXT NOT NULL,
    "git_id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,

    CONSTRAINT "Solutions_pkey" PRIMARY KEY ("course_id","assignment_title","author_id")
);

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

-- CreateTable
CREATE TABLE "Users" (
    "utorid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("utorid")
);

-- CreateTable
CREATE TABLE "_Roles" (
    "type" "RoleType" NOT NULL DEFAULT 'STUDENT',
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "_Roles_pkey" PRIMARY KEY ("user_id","course_id")
);

-- CreateTable
CREATE TABLE "_Scores" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pass" BOOLEAN NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,
    "solution_author_id" TEXT NOT NULL,
    "testcase_author_id" TEXT NOT NULL,

    CONSTRAINT "_Scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignments_course_id_title_key" ON "Assignments"("course_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Solutions_course_id_assignment_title_author_id_key" ON "Solutions"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "Testcases_course_id_assignment_title_author_id_key" ON "Testcases"("course_id", "assignment_title", "author_id");

-- CreateIndex
CREATE UNIQUE INDEX "_Roles_user_id_course_id_key" ON "_Roles"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_fkey" FOREIGN KEY ("course_id", "assignment_title", "solution_author_id") REFERENCES "Solutions"("course_id", "assignment_title", "author_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_fkey" FOREIGN KEY ("course_id", "assignment_title", "testcase_author_id") REFERENCES "Testcases"("course_id", "assignment_title", "author_id") ON DELETE CASCADE ON UPDATE CASCADE;
