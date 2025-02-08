/*
  Warnings:

  - The values [GOOGLE,PHONE] on the enum `UserProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'PHONE', 'FACEBOOK', 'EMAIL');

-- AlterEnum
BEGIN;
CREATE TYPE "UserProvider_new" AS ENUM ('LOCAL', 'FIREBASE');
ALTER TABLE "User" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "UserProvider_new" USING ("provider"::text::"UserProvider_new");
ALTER TYPE "UserProvider" RENAME TO "UserProvider_old";
ALTER TYPE "UserProvider_new" RENAME TO "UserProvider";
DROP TYPE "UserProvider_old";
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'LOCAL';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "providerType" "ProviderType" NOT NULL DEFAULT 'EMAIL';
