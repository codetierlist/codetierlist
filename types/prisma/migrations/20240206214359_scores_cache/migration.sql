-- CreateTable
CREATE TABLE "_ScoreCache" (
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pass" BOOLEAN NOT NULL,
    "course_id" TEXT NOT NULL,
    "assignment_title" TEXT NOT NULL,
    "testcase_author_id" TEXT NOT NULL,
    "solution_author_id" TEXT NOT NULL,
    "score_id" TEXT NOT NULL,

    CONSTRAINT "_ScoreCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_ScoreCache_course_id_assignment_title_testcase_author_id_s_key" ON "_ScoreCache"("course_id", "assignment_title", "testcase_author_id", "solution_author_id");

-- AddForeignKey
ALTER TABLE "_ScoreCache" ADD CONSTRAINT "_ScoreCache_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "_Scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
