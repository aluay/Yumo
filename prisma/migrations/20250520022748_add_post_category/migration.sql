-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('TUTORIAL', 'DISCUSSION', 'SHOWCASE', 'EXPERIENCE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" "PostCategory" NOT NULL DEFAULT 'DISCUSSION';
