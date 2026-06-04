/*
  Warnings:

  - You are about to drop the column `deletedFor` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "deletedFor";
