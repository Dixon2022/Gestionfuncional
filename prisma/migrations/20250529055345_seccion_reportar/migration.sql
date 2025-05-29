-- CreateTable
CREATE TABLE "PropertyReport" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
