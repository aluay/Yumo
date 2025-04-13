-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ScriptStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "dependencies" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" "DifficultyLevel",
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ScriptStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
