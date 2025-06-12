/*
  Warnings:

  - The primary key for the `Property` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PropertyImage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "PropertyImage" DROP CONSTRAINT "PropertyImage_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyReport" DROP CONSTRAINT "PropertyReport_propertyId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP CONSTRAINT "Property_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ADD CONSTRAINT "Property_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PropertyImage" DROP CONSTRAINT "PropertyImage_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "propertyId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PropertyReport" ALTER COLUMN "propertyId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
