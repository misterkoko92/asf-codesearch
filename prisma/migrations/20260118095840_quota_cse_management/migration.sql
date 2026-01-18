-- CreateTable
CREATE TABLE "ExternalSearchUsage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalSearchUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalSearchUsage_provider_windowStart_windowEnd_idx" ON "ExternalSearchUsage"("provider", "windowStart", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSearchUsage_provider_windowStart_windowEnd_key" ON "ExternalSearchUsage"("provider", "windowStart", "windowEnd");
