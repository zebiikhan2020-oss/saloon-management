import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function getCustomerFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    if (!payload.id || payload.role !== "CUSTOMER") return null;

    return payload;
  } catch (error) {
    console.error("CUSTOMER TOKEN ERROR:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("portfolioId");

    const where = {};
    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    const reviews = await prisma.portfolioReview.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { portfolioId, rating, comment } = await request.json();

    if (!portfolioId || !rating) {
      return NextResponse.json(
        { success: false, message: "Portfolio ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if customer already reviewed this portfolio
    const existingReview = await prisma.portfolioReview.findUnique({
      where: {
        portfolioId_customerId: {
          portfolioId,
          customerId: customer.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this portfolio" },
        { status: 400 }
      );
    }

    const review = await prisma.portfolioReview.create({
      data: {
        portfolioId,
        customerId: customer.id,
        rating,
        comment: comment || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    // =======================
// CREATE REVIEW NOTIFICATIONS
// =======================

// Get portfolio owner (staff)
const portfolio = await prisma.staffPortfolio.findUnique({
  where: {
    id: portfolioId,
  },
  select: {
    id: true,
    title: true,
    staffId: true,
  },
});

if (portfolio) {
  // Notify staff who owns this portfolio
  await prisma.notification.create({
    data: {
      userId: portfolio.staffId,
      title: "New Portfolio Review",
      message: `${customer.name || "A customer"} reviewed your portfolio "${portfolio.title}" with ${rating}/5 stars.`,
      type: "REVIEW",
    },
  });

  // Notify all admins
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "New Portfolio Review",
        message: `${customer.name || "A customer"} reviewed "${portfolio.title}" with ${rating}/5 stars.`,
        type: "REVIEW",
      })),
    });
  }
}

    return NextResponse.json(
      { success: true, message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, rating, comment } = await request.json();

    if (!id || !rating) {
      return NextResponse.json(
        { success: false, message: "ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if review belongs to customer
    const existingReview = await prisma.portfolioReview.findFirst({
      where: {
        id,
        customerId: customer.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    const review = await prisma.portfolioReview.update({
      where: { id },
      data: {
        rating,
        comment: comment || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Review updated successfully", review }
    );
  } catch (error) {
    console.error("PUT REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    // Check if review belongs to customer
    const existingReview = await prisma.portfolioReview.findFirst({
      where: {
        id,
        customerId: customer.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await prisma.portfolioReview.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" }
    );
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}
