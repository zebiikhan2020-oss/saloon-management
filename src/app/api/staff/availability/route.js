import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getUserId(decoded) {
  return decoded.userId || decoded.id || decoded.staffId;
}

// Get today's day name
function getTodayName() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Karachi",
  }).format(new Date());
}

// ==============================
// GET STAFF AVAILABILITY
// ==============================

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("JWT DATA:", decoded);

    const staffId = getUserId(decoded);

    console.log("FINAL STAFF ID:", staffId);

    if (!staffId) {
      return NextResponse.json(
        { message: "Staff id not found in token" },
        { status: 400 }
      );
    }

    const todayName = getTodayName();

    // ==============================
    // GET EXISTING SCHEDULES
    // ==============================

    let schedules = await prisma.staffSchedule.findMany({
      where: {
        staffId,
      },
      orderBy: {
        id: "asc",
      },
    });

    // ==============================
    // CREATE MISSING SCHEDULES
    // All days are WORKING by default
    // Sunday is NOT forced OFF
    // ==============================

    if (schedules.length === 0) {
      await prisma.staffSchedule.createMany({
        data: days.map((day) => ({
          staffId,
          day,
          status: "WORKING",
        })),
      });

      schedules = await prisma.staffSchedule.findMany({
        where: {
          staffId,
        },
        orderBy: {
          id: "asc",
        },
      });
    }

    // ==============================
    // ADD EXTRA INFORMATION
    // ==============================

    const todayIndex = days.indexOf(todayName);

    const updatedSchedules = schedules.map((schedule) => {
      const dayIndex = days.indexOf(schedule.day);

      return {
        ...schedule,

        // Is today?
        isToday: schedule.day === todayName,

        // Past day
        isPast: dayIndex < todayIndex,

        // Can staff change this day?
        canEdit: dayIndex > todayIndex,

        // No Sunday holiday anymore
        isHoliday: false,

        // Display message
        message:
          schedule.day === todayName
            ? "Today cannot be changed"
            : dayIndex < todayIndex
            ? "Past day cannot be changed"
            : null,
      };
    });

    return NextResponse.json(updatedSchedules);
  } catch (error) {
    console.log(
      "GET STAFF AVAILABILITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

// ==============================
// PATCH UPDATE AVAILABILITY
// ==============================

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId = getUserId(decoded);

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff id not found",
        },
        {
          status: 400,
        }
      );
    }

    const { day, status } = await request.json();

    if (!day || !status) {
      return NextResponse.json(
        {
          message: "Day and status are required",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // CHECK DAY
    // ==============================

    if (!days.includes(day)) {
      return NextResponse.json(
        {
          message: "Invalid day",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // ONLY WORKING / OFF ALLOWED
    // ==============================

    if (!["WORKING", "OFF"].includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid availability status",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // TODAY CHECK
    // ==============================

    const todayName = getTodayName();

    const todayIndex = days.indexOf(todayName);
    const selectedDayIndex = days.indexOf(day);

    // Today cannot be changed
    if (selectedDayIndex <= todayIndex) {
      return NextResponse.json(
        {
          message:
            day === todayName
              ? "Today's availability cannot be changed."
              : "Past days cannot be changed.",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // FIND SCHEDULE
    // ==============================

    const schedule =
      await prisma.staffSchedule.findFirst({
        where: {
          staffId,
          day,
        },
      });

    if (!schedule) {
      return NextResponse.json(
        {
          message: "Schedule not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==============================
    // UPDATE
    // ==============================

    const updatedSchedule =
      await prisma.staffSchedule.update({
        where: {
          id: schedule.id,
        },
        data: {
          status,
        },
      });

    return NextResponse.json({
      message: `${day} availability updated successfully`,
      updatedSchedule,
    });
  } catch (error) {
    console.log(
      "UPDATE STAFF AVAILABILITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}