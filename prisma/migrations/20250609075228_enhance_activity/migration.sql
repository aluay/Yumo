/*
  Warnings:

  - Added the required column `updatedAt` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'POST_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'POST_UNLIKED';
ALTER TYPE "ActivityType" ADD VALUE 'POST_UNBOOKMARKED';
ALTER TYPE "ActivityType" ADD VALUE 'POST_VIEWED';
ALTER TYPE "ActivityType" ADD VALUE 'POST_SHARED';
ALTER TYPE "ActivityType" ADD VALUE 'COMMENT_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'COMMENT_UNLIKED';
ALTER TYPE "ActivityType" ADD VALUE 'COMMENT_REPLIED';
ALTER TYPE "ActivityType" ADD VALUE 'USER_UNFOLLOWED';
ALTER TYPE "ActivityType" ADD VALUE 'USER_PROFILE_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'TAG_FOLLOWED';
ALTER TYPE "ActivityType" ADD VALUE 'TAG_UNFOLLOWED';
ALTER TYPE "ActivityType" ADD VALUE 'ACCOUNT_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'LOGIN';

-- AlterEnum
ALTER TYPE "TargetType" ADD VALUE 'TAG';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" "ActivityPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "targetTitle" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "ActivityMention" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Activity_userId_type_idx" ON "Activity"("userId", "type");

-- CreateIndex
CREATE INDEX "Activity_type_createdAt_idx" ON "Activity"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_targetType_targetId_idx" ON "Activity"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityMention_userId_isRead_idx" ON "ActivityMention"("userId", "isRead");
