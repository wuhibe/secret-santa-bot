/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "groups_telegramId_key" ON "groups"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");
