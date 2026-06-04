-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "deletedFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
