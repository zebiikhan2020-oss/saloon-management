import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");

    // =====================================================
    // GET APPROVED STAFF
    // =====================================================

    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
        isApproved: true,
        isEmailVerified: true,
        isBlocked: false,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // =====================================================
    // IF DATE IS NOT SELECTED
    // =====================================================

    if (!date) {
      return NextResponse.json(staff, {
        status: 200,
      });
    }

    // =====================================================
    // SELECTED DATE
    // =====================================================

    const selectedDate = new Date(`${date}T00:00:00`);

    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid date",
        },
        {
          status: 400,
        }
      );
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDay =
      dayNames[selectedDate.getDay()];

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // =====================================================
    // FILTER AVAILABLE STAFF
    // =====================================================

    const availableStaff = [];

    for (const person of staff) {
      // ===================================================
      // 1. APPROVED LEAVE CHECK
      // ===================================================

      const approvedLeave =
        await prisma.leaveRequest.findFirst({
          where: {
            staffId: person.id,
            status: "APPROVED",

            startDate: {
              lte: endOfDay,
            },

            endDate: {
              gte: startOfDay,
            },
          },
        });

      if (approvedLeave) {
        continue;
      }

      // ===================================================
      // 2. ATTENDANCE CHECK
      // ===================================================

      const attendance =
        await prisma.attendance.findFirst({
          where: {
            staffId: person.id,

            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },

          select: {
            status: true,
          },
        });

      // ABSENT
      if (attendance?.status === "ABSENT") {
        continue;
      }

      // LEAVE
      if (attendance?.status === "LEAVE") {
        continue;
      }

      // ===================================================
      // 3. STAFF SCHEDULE CHECK
      // ===================================================

      const schedule =
        await prisma.staffSchedule.findFirst({
          where: {
            staffId: person.id,
            day: selectedDay,
          },

          select: {
            status: true,
          },
        });

      // OFF
      if (schedule?.status === "OFF") {
        continue;
      }

      // ===================================================
      // STAFF AVAILABLE
      // ===================================================

      availableStaff.push(person);
    }

    return NextResponse.json(
      availableStaff,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET CUSTOMER STAFF ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch staff",
      },
      {
        status: 500,
      }
    );
  }
}