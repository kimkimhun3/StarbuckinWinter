-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "postId" TEXT,
    "city" TEXT,
    "country" TEXT,
    "countryRegion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_postId_idx" ON "PageView"("postId");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_country_idx" ON "PageView"("country");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
