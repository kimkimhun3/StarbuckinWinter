-- CreateTable
CREATE TABLE "RandomMessage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT NOT NULL,
    "memo" TEXT,
    "images" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RandomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RandomMessage_published_idx" ON "RandomMessage"("published");
