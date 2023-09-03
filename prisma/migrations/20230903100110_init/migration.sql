-- CreateEnum
CREATE TYPE "TwoFactorTypeEnum" AS ENUM ('totp');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "hashRefreshToken" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorIsEnable" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorType" "TwoFactorTypeEnum",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
