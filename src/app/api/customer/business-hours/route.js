import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET CUSTOMER BUSINESS HOURS
// Weekly + Special Business Hours
// =====================================================

export async function GET() {
  try {
    // Get weekly business hours
    const businessHours =
      await prisma.businessHour.findMany({
        orderBy: {
          id: "asc",
        },
      });

    // Get special business hours
    const specialBusinessHours =
      await prisma.specialBusinessHour.findMany({
        orderBy: {
          date: "asc",
        },
      });

    return NextResponse.json(
      {
        businessHours,
        specialBusinessHours,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET CUSTOMER BUSINESS HOURS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load business hours",
      },
      {
        status: 500,
      }
    );
  }
}