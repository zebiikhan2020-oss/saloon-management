CREATE TABLE "StaffPortfolio" (
  "id" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffPortfolio_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StaffPortfolio"
ADD CONSTRAINT "StaffPortfolio_staffId_fkey"
FOREIGN KEY ("staffId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
