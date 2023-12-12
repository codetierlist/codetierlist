-- AlterTable
ALTER TABLE "Assignments" ADD COLUMN     "image_version" TEXT NOT NULL DEFAULT '3.10.11',
ADD COLUMN     "runner_image" TEXT NOT NULL DEFAULT 'python';
