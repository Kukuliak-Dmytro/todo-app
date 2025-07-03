-- DropForeignKey
ALTER TABLE "TodoShare" DROP CONSTRAINT "TodoShare_todoId_fkey";

-- AlterTable
ALTER TABLE "TodoShare" ALTER COLUMN "todoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TodoShare" ADD CONSTRAINT "TodoShare_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
