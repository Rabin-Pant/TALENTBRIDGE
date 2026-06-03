-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyDocument" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "companyRegNumber" TEXT,
ADD COLUMN     "education" JSONB,
ADD COLUMN     "workExperience" JSONB;
