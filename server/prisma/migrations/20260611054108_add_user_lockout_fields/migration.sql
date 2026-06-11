-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockoutUntil" TIMESTAMP(3);
