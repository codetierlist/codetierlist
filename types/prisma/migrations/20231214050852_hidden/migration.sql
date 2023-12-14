-- AlterTable
ALTER TABLE "Assignments" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;
