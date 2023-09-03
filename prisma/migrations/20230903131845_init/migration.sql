-- CreateEnum
CREATE TYPE "TwoFactorTypesEnum" AS ENUM ('totp');

-- CreateEnum
CREATE TYPE "PermissionsEnum" AS ENUM ('super', 'admin', 'support', 'manager', 'customer', 'moderator');

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
    "twoFactorType" "TwoFactorTypesEnum",
    "permissions" "PermissionsEnum"[] DEFAULT ARRAY['customer']::"PermissionsEnum"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
