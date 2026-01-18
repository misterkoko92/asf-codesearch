-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('manual', 'csv', 'external');

-- CreateEnum
CREATE TYPE "ExternalSource" AS ENUM ('open_food_facts', 'open_medic', 'bdpm');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "color" TEXT,
    "categoryL1" TEXT,
    "categoryL2" TEXT,
    "categoryL3" TEXT,
    "categoryL4" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warehouse" TEXT,
    "rack" TEXT,
    "shelf" TEXT,
    "bin" TEXT,
    "rackColor" TEXT,
    "barcode" TEXT,
    "ean" TEXT,
    "gtin" TEXT,
    "cip" TEXT,
    "priceHt" DECIMAL(12,2),
    "vatRate" DECIMAL(6,2),
    "priceTtc" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "lengthCm" DOUBLE PRECISION,
    "widthCm" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "weightG" DOUBLE PRECISION,
    "volumeCm3" DOUBLE PRECISION,
    "quantity" INTEGER,
    "storageConditions" TEXT,
    "perishable" BOOLEAN,
    "quarantineDefault" BOOLEAN,
    "notes" TEXT,
    "photoUrl" TEXT,
    "sourceType" "SourceType" NOT NULL DEFAULT 'manual',
    "sourceName" TEXT,
    "sourceSupplier" TEXT,
    "sourceRef" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalProduct" (
    "id" TEXT NOT NULL,
    "source" "ExternalSource" NOT NULL,
    "sourceId" TEXT,
    "name" TEXT,
    "brand" TEXT,
    "ean" TEXT,
    "gtin" TEXT,
    "cip" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_ean_key" ON "Product"("ean");

-- CreateIndex
CREATE UNIQUE INDEX "Product_gtin_key" ON "Product"("gtin");

-- CreateIndex
CREATE UNIQUE INDEX "Product_cip_key" ON "Product"("cip");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "Product_categoryL1_idx" ON "Product"("categoryL1");

-- CreateIndex
CREATE INDEX "Product_categoryL2_idx" ON "Product"("categoryL2");

-- CreateIndex
CREATE INDEX "Product_categoryL3_idx" ON "Product"("categoryL3");

-- CreateIndex
CREATE INDEX "Product_categoryL4_idx" ON "Product"("categoryL4");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "ExternalProduct_ean_idx" ON "ExternalProduct"("ean");

-- CreateIndex
CREATE INDEX "ExternalProduct_gtin_idx" ON "ExternalProduct"("gtin");

-- CreateIndex
CREATE INDEX "ExternalProduct_cip_idx" ON "ExternalProduct"("cip");

-- CreateIndex
CREATE INDEX "ExternalProduct_source_sourceId_idx" ON "ExternalProduct"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
