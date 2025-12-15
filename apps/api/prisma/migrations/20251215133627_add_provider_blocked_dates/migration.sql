-- CreateTable
CREATE TABLE "ProviderBlockedDate" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderBlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderBlockedDate_providerId_idx" ON "ProviderBlockedDate"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderBlockedDate_providerId_date_key" ON "ProviderBlockedDate"("providerId", "date");

-- AddForeignKey
ALTER TABLE "ProviderBlockedDate" ADD CONSTRAINT "ProviderBlockedDate_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
