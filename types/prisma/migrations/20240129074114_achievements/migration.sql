-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "new_achievements" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Achievements" (
    "id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utorid" TEXT NOT NULL,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id","utorid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_id_utorid_key" ON "Achievements"("id", "utorid");

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_utorid_fkey" FOREIGN KEY ("utorid") REFERENCES "Users"("utorid") ON DELETE CASCADE ON UPDATE CASCADE;
