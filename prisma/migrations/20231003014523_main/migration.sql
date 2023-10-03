-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INSTRUCTOR', 'TA', 'STUDENT');

-- CreateTable
CREATE TABLE "Assignments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "Assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solutions" (
    "id" TEXT NOT NULL,
    "git_url" TEXT NOT NULL,
    "git_id" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "Solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCases" (
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "override" BOOLEAN NOT NULL DEFAULT false,
    "git_url" TEXT NOT NULL,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "git_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,

    CONSTRAINT "TestCases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "utorid" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("utorid")
);

-- CreateTable
CREATE TABLE "_Roles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" "RoleType" NOT NULL DEFAULT 'STUDENT',
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "_Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Scores" (
    "test_id" TEXT NOT NULL,
    "solution_id" TEXT NOT NULL,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pass" BOOLEAN NOT NULL,

    CONSTRAINT "_Scores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solutions" ADD CONSTRAINT "Solutions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCases" ADD CONSTRAINT "TestCases_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Roles" ADD CONSTRAINT "_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "Solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Scores" ADD CONSTRAINT "_Scores_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "TestCases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
