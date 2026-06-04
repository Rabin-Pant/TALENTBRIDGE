-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "deletedFor" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "deletedFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
