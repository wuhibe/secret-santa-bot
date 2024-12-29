/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,telegramId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_groupId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "groupId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "groups_telegramId_key" ON "groups"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_groupId_telegramId_key" ON "users"("groupId", "telegramId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
