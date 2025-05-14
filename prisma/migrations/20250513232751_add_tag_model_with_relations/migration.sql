-- DropIndex
DROP INDEX "post_description_trgm_idx";

-- DropIndex
DROP INDEX "post_title_trgm_idx";

-- DropIndex
DROP INDEX "user_email_trgm_idx";

-- DropIndex
DROP INDEX "user_name_trgm_idx";

-- CreateTable
CREATE TABLE "Tag" (
    "name" TEXT NOT NULL,
    "postCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "TagFollow" ADD CONSTRAINT "TagFollow_tag_fkey" FOREIGN KEY ("tag") REFERENCES "Tag"("name") ON DELETE CASCADE ON UPDATE CASCADE;
