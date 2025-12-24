/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,type,isDeleted]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Category_isSystem_idx" ON "Category"("isSystem");

-- CreateIndex
CREATE INDEX "Category_isSystem_type_idx" ON "Category"("isSystem", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_type_isDeleted_key" ON "Category"("userId", "name", "type", "isDeleted");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
