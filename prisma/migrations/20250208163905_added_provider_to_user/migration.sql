-- CreateEnum
CREATE TYPE "UserProvider" AS ENUM ('LOCAL', 'GOOGLE', 'PHONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "UserProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT;
