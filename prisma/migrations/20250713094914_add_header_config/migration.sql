-- CreateTable
CREATE TABLE "HeaderConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "announcement" JSONB NOT NULL DEFAULT '{}',
    "genderTabs" JSONB NOT NULL DEFAULT '[]',
    "trendingImages" JSONB NOT NULL DEFAULT '[]',
    "navigation" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderConfig_pkey" PRIMARY KEY ("id")
);
