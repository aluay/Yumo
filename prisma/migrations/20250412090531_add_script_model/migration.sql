-- CreateTable
CREATE TABLE "Script" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
