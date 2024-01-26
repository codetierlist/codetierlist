-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('INVALID', 'VALID', 'PENDING', 'EMPTY');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INSTRUCTOR', 'TA', 'STUDENT');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "Assignments" (
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "runner_image" TEXT NOT NULL,
    "image_version" TEXT NOT NULL,
    "group_size" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Assignments_pkey" PRIMARY KEY ("course_id","title")
);

-- CreateTable
CREATE TABLE "Groups" (
    "_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "number" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Courses" (
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cover" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solutions" (
    "_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "git_url" TEXT NOT NULL,
    "git_id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,
    "group_number" INTEGER,

    CONSTRAINT "Solutions_pkey" PRIMARY KEY ("course_id","assignment_title","author_id","git_id")
);

-- CreateTable
CREATE TABLE "Testcases" (
    "_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "git_url" TEXT NOT NULL,
    "git_id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,
    "valid" "TestCaseStatus" NOT NULL DEFAULT 'PENDING',
    "group_number" INTEGER
);

-- CreateTable
CREATE TABLE "Users" (
    "utorid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "surname" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'LIGHT',

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
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pass" BOOLEAN NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,
    "solution_author_id" TEXT NOT NULL,
    "solution_commit_id" TEXT NOT NULL,
    "testcase_author_id" TEXT NOT NULL,
    "testcase_commit_id" TEXT NOT NULL,

    CONSTRAINT "_Scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignments_course_id_title_key" ON "Assignments"("course_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Groups_course_id_assignment_title_number_key" ON "Groups"("course_id", "assignment_title", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Solutions__id_key" ON "Solutions"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Solutions_course_id_assignment_title_author_id_git_id_key" ON "Solutions"("course_id", "assignment_title", "author_id", "git_id");

-- CreateIndex
CREATE UNIQUE INDEX "Testcases__id_key" ON "Testcases"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Testcases_course_id_assignment_title_author_id_git_id_key" ON "Testcases"("course_id", "assignment_title", "author_id", "git_id");

-- CreateIndex
CREATE UNIQUE INDEX "_Roles_user_id_course_id_key" ON "_Roles"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToUser_AB_unique" ON "_GroupToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToUser_B_index" ON "_GroupToUser"("B");

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_course_id_assignment_title_fkey" FOREIGN KEY ("course_id", "assignment_title") REFERENCES "Assignments"("course_id", "title") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_course_id_assignment_title_fkey" FOREIGN KEY ("course_id", "assignment_title") REFERENCES "Assignments"("course_id", "title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_group_number_assignment_title_course_id_fkey" FOREIGN KEY ("group_number", "assignment_title", "course_id") REFERENCES "Groups"("number", "assignment_title", "course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_course_id_assignment_title_fkey" FOREIGN KEY ("course_id", "assignment_title") REFERENCES "Assignments"("course_id", "title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testcases" ADD CONSTRAINT "Testcases_group_number_assignment_title_course_id_fkey" FOREIGN KEY ("group_number", "assignment_title", "course_id") REFERENCES "Groups"("number", "assignment_title", "course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_solution_author_id_solu_fkey" FOREIGN KEY ("course_id", "assignment_title", "solution_author_id", "solution_commit_id") REFERENCES "Solutions"("course_id", "assignment_title", "author_id", "git_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_course_id_assignment_title_testcase_author_id_test_fkey" FOREIGN KEY ("course_id", "assignment_title", "testcase_author_id", "testcase_commit_id") REFERENCES "Testcases"("course_id", "assignment_title", "author_id", "git_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Groups"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;
