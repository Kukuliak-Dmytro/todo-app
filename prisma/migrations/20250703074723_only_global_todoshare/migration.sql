/*
  Warnings:

  - You are about to drop the column `todoId` on the `TodoShare` table. All the data in the column will be lost.
  - Added the required column `inviterUserId` to the `TodoShare` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TodoShare" DROP CONSTRAINT "TodoShare_todoId_fkey";

-- AlterTable
ALTER TABLE "TodoShare" DROP COLUMN "todoId",
ADD COLUMN     "inviterUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TodoShare" ADD CONSTRAINT "TodoShare_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
