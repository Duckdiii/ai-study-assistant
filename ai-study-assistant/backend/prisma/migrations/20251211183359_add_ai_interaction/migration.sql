/*
  Warnings:

  - Changed the type of `type` on the `AiInteraction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AiInteraction" ADD COLUMN     "problemId" INTEGER,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiInteraction" ADD CONSTRAINT "AiInteraction_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
