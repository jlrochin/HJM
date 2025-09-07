/*
  Warnings:

  - You are about to drop the column `is_invisible` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_invisible",
ADD COLUMN     "last_active_at" TIMESTAMP(3);
