import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    // ==============================
    // ADMIN AUTHENTICATION
    // ==============================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          available: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          available: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    // ==============================
    // GET QUERY PARAMETERS
    // ==============================

    const { searchParams } = new URL(request.url);

    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    if (!staffId || !date) {
      return NextResponse.json(
        {
          available: false,
          message: "Staff ID and date are required",
        },
        { status: 400 }
      );
    }

    // ==============================
    // CHECK STAFF
    // ==============================

    const staff = await prisma.user.findFirst({
      where: {
        id: staffId,
        role: "STAFF",
        isApproved: true,
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        isBlocked: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        {
          available: false,
          message: "Staff member is not available",
        },
        { status: 404 }
      );
    }

    // ==============================
    // BLOCKED STAFF
    // ==============================

    if (staff.isBlocked) {
      return NextResponse.json({
        available: false,
        reason: "BLOCKED",
        message: "This staff member is currently unavailable.",
      });
    }

    // ==============================
    // APPOINTMENT DATE
    // ==============================

    const appointmentDate = new Date(`${date}T00:00:00`);

    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        {
          available: false,
          message: "Invalid date",
        },
        { status: 400 }
      );
    }

    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ==============================
    // CHECK APPROVED LEAVE
    // ==============================

    const approvedLeave = await prisma.leaveRequest.findFirst({
      where: {
        staffId,

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
      return NextResponse.json({
        available: false,
        reason: "LEAVE",
        message: "This staff member is on leave on this date.",
      });
    }

    // ==============================
    // CHECK ABSENT
    // ==============================

    const absentAttendance = await prisma.attendance.findFirst({
      where: {
        staffId,

        status: "ABSENT",

        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (absentAttendance) {
      return NextResponse.json({
        available: false,
        reason: "ABSENT",
        message: "This staff member is absent on this date.",
      });
    }

    // ==============================
    // CHECK STAFF WEEKLY SCHEDULE
    // ==============================

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDay = dayNames[appointmentDate.getDay()];

    const staffSchedule = await prisma.staffSchedule.findFirst({
      where: {
        staffId,
        day: selectedDay,
      },
    });

    if (staffSchedule && staffSchedule.status === "OFF") {
      return NextResponse.json({
        available: false,
        reason: "OFF",
        message: `This staff member is off on ${selectedDay}.`,
      });
    }

    // ==============================
    // STAFF AVAILABLE
    // ==============================

    return NextResponse.json({
      available: true,
      reason: null,
      message: "Staff member is available.",
    });
  } catch (error) {
    console.error("STAFF AVAILABILITY ERROR:", error);

    return NextResponse.json(
      {
        available: false,
        message: "Failed to check staff availability",
      },
      { status: 500 }
    );
  }
}