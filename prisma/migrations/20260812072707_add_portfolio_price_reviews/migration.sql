-- AlterTable
ALTER TABLE "StaffPortfolio" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PortfolioReview" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioReview_portfolioId_customerId_key" ON "PortfolioReview"("portfolioId", "customerId");

-- AddForeignKey
ALTER TABLE "PortfolioReview" ADD CONSTRAINT "PortfolioReview_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "StaffPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioReview" ADD CONSTRAINT "PortfolioReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
