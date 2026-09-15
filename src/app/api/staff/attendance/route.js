import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// =====================================================
// POST - MARK ATTENDANCE
// =====================================================

export async function POST(request) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    console.log(
      "ATTENDANCE STAFF ID:",
      staffId
    );

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // REQUEST DATA
    // =====================================================

    const { status, note } = await request.json();

    if (
      !status ||
      !["PRESENT", "ABSENT", "LEAVE"].includes(status)
    ) {
      return NextResponse.json(
        {
          message: "Invalid attendance status",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // GET CURRENT PAKISTAN DATE & TIME
    // =====================================================

    const pakistanParts = new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    ).formatToParts(new Date());

    const getPart = (type) =>
      pakistanParts.find(
        (part) => part.type === type
      )?.value;

    const currentYear = Number(
      getPart("year")
    );

    const currentMonth = Number(
      getPart("month")
    );

    const currentDay = Number(
      getPart("day")
    );

    const currentHour = Number(
      getPart("hour")
    );

    const currentMinute = Number(
      getPart("minute")
    );

    const currentSecond = Number(
      getPart("second")
    );

    // =====================================================
    // ATTENDANCE TIME RESTRICTION
    // SHOP OPENS AT 09:00 AM
    // =====================================================

    const currentMinutes =
      currentHour * 60 + currentMinute;

    const openingMinutes = 9 * 60;

    // Before 09:00 AM
    if (currentMinutes < openingMinutes) {
      return NextResponse.json(
        {
          message:
            "Attendance can only be marked from 09:00 AM onwards.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PAKISTAN CURRENT DATE/TIME
    // =====================================================

    const now = new Date(
      `${currentYear}-${String(
        currentMonth
      ).padStart(2, "0")}-${String(
        currentDay
      ).padStart(2, "0")}T${String(
        currentHour
      ).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}:${String(
        currentSecond
      ).padStart(2, "0")}+05:00`
    );

    // =====================================================
    // TODAY AT 00:00:00 PAKISTAN TIME
    // =====================================================

    const today = new Date(
      `${currentYear}-${String(
        currentMonth
      ).padStart(2, "0")}-${String(
        currentDay
      ).padStart(2, "0")}T00:00:00+05:00`
    );

    // =====================================================
    // TODAY RANGE
    // =====================================================

    const startOfDay = new Date(today);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // =====================================================
    // CHECK APPROVED LEAVE
    // =====================================================

    const approvedLeave =
      await prisma.leaveRequest.findFirst({
        where: {
          staffId,

          status: "APPROVED",

          startDate: {
            lte: today,
          },

          endDate: {
            gte: today,
          },
        },
      });

    if (approvedLeave) {
      return NextResponse.json(
        {
          message:
            "You are on approved leave today",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CHECK EXISTING ATTENDANCE
    // =====================================================

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          staffId,

          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    if (existingAttendance) {
      return NextResponse.json(
        {
          message:
            "Attendance already marked for today",
          attendance: existingAttendance,
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CREATE ATTENDANCE
    // =====================================================

    const attendance =
      await prisma.attendance.create({
        data: {
          staffId,

          date: today,

          checkInTime: now,

          status,

          note: note || null,
        },
      });

    // =====================================================
    // HANDLE APPOINTMENTS WHEN STAFF IS ABSENT
    // =====================================================

    if (status === "ABSENT") {
      const affectedAppointments =
        await prisma.appointment.findMany({
          where: {
            staffId,

            date: {
              gte: startOfDay,
              lte: endOfDay,
            },

            status: {
              in: [
                "PENDING",
                "CONFIRMED",
              ],
            },
          },

          select: {
            id: true,

            customerId: true,

            service: {
              select: {
                name: true,
              },
            },
          },
        });

      // ===================================================
      // REMOVE STAFF FROM TODAY'S APPOINTMENTS
      // ===================================================

      if (
        affectedAppointments.length > 0
      ) {
        await prisma.appointment.updateMany({
          where: {
            id: {
              in: affectedAppointments.map(
                (appointment) =>
                  appointment.id
              ),
            },
          },

          data: {
            staffId: null,

            status: "PENDING",
          },
        });

        // =================================================
        // CUSTOMER NOTIFICATIONS
        // =================================================

        await prisma.notification.createMany({
          data: affectedAppointments.map(
            (appointment) => ({
              userId:
                appointment.customerId,

              title:
                "Staff Unavailable",

              message: `Your appointment for ${
                appointment.service?.name ||
                "your service"
              } needs staff reassignment because the selected staff member is absent today.`,

              type: "APPOINTMENT",

              appointmentId:
                appointment.id,
            })
          ),
        });
      }
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        message:
          "Attendance marked successfully",

        attendance,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(
      "MARK ATTENDANCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// GET STAFF ATTENDANCE
// =====================================================

export async function GET(request) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

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

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // GET DATE FILTER
    // =====================================================

    const { searchParams } =
      new URL(request.url);

    const date =
      searchParams.get("date");

    const where = {
      staffId,
    };

    // =====================================================
    // DATE FILTER
    // =====================================================

    if (date) {
      const selectedDate =
        new Date(date);

      const startOfDay =
        new Date(selectedDate);

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date(selectedDate);

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // =====================================================
    // GET ATTENDANCE
    // =====================================================

    const attendance =
      await prisma.attendance.findMany({
        where,

        orderBy: {
          date: "desc",
        },
      });

    return NextResponse.json(
      attendance
    );
  } catch (error) {
    console.log(
      "GET ATTENDANCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}