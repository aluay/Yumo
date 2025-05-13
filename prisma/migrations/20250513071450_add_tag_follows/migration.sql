-- CreateTable
CREATE TABLE "TagFollow" (
    "userId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagFollow_pkey" PRIMARY KEY ("userId","tag")
);

-- CreateIndex
CREATE INDEX "TagFollow_tag_idx" ON "TagFollow"("tag");

-- AddForeignKey
ALTER TABLE "TagFollow" ADD CONSTRAINT "TagFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
