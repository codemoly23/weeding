-- AlterTable
ALTER TABLE "HeaderConfig" ADD COLUMN     "loginStyle" JSONB,
ADD COLUMN     "loginUrl" TEXT NOT NULL DEFAULT '/auth/signin',
ADD COLUMN     "registerStyle" JSONB;
