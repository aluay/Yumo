/*
  Warnings:

  - Added the required column `code` to the `Script` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "code" TEXT NOT NULL;
