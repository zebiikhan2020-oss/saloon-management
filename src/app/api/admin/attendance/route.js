import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where = {};

    if (staffId) {
      where.staffId = staffId;
    }

    if (status) {
      where.status = status;
    }

    // Filter by selected date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(attendance, {
      status: 200,
    });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch attendance",
      },
      {
        status: 500,
      }
    );
  }
}