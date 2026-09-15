import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    const where = {};
    if (staffId) {
      where.staffId = staffId;
    }

    const portfolios = await prisma.staffPortfolio.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating for each portfolio
    const portfoliosWithRating = portfolios.map((portfolio) => {
      const reviews = portfolio.reviews || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        ...portfolio,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    return NextResponse.json({ success: true, portfolios: portfoliosWithRating });
  } catch (error) {
    console.error("GET PORTFOLIOS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch portfolios" },
      { status: 500 }
    );
  }
}
