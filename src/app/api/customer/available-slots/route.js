import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =====================================================
// GET AVAILABLE TIME SLOTS
// =====================================================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");

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

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    if (decoded.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    const customerId = decoded.id;

    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    if (!date || !serviceId) {
      return NextResponse.json(
        {
          message: "Date and service ID are required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDATE DATE FORMAT
    // =====================================================

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          message: "Invalid date format",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PAKISTAN TODAY
    // =====================================================

    const pakistanToday = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Karachi",
      }
    ).format(new Date());

    console.log("=================================");
    console.log("SELECTED DATE:", date);
    console.log("PAKISTAN TODAY:", pakistanToday);
    console.log("CUSTOMER ID:", customerId);
    console.log("STAFF ID:", staffId);
    console.log("=================================");

    // =====================================================
    // PAST DATE CHECK
    // =====================================================

    if (date < pakistanToday) {
      return NextResponse.json(
        {
          availableSlots: [],
          message: "Past date is not allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CREATE BOOKING DATE
    // =====================================================

    const bookingDate = new Date(`${date}T00:00:00`);

    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid date",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // GET SERVICE
    // =====================================================

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          message: "Service not found",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CHECK SERVICE STATUS
    // =====================================================

    if (!service.status) {
      return NextResponse.json(
        {
          availableSlots: [],
          message:
            "This service is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // GET SELECTED DAY
    // =====================================================

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
      dayNames[bookingDate.getDay()];

    console.log(
      "SELECTED DAY:",
      selectedDay
    );

    // =====================================================
    // GET SPECIAL BUSINESS HOURS
    // =====================================================

    const specialBusinessHour =
      await prisma.specialBusinessHour.findUnique({
        where: {
          date: bookingDate,
        },
      });

    // =====================================================
    // GET BUSINESS HOURS
    // =====================================================

    let businessHour;

    if (specialBusinessHour) {
      businessHour = specialBusinessHour;

      console.log(
        "USING SPECIAL BUSINESS HOURS:",
        businessHour
      );
    } else {
      businessHour =
        await prisma.businessHour.findUnique({
          where: {
            day: selectedDay,
          },
        });

      console.log(
        "USING WEEKLY BUSINESS HOURS:",
        businessHour
      );
    }

    // =====================================================
    // NO BUSINESS HOURS
    // =====================================================

    if (!businessHour) {
      return NextResponse.json({
        availableSlots: [],
        message:
          "Business hours are not configured for this date.",
      });
    }

    // =====================================================
    // CLOSED
    // =====================================================

    if (businessHour.type === "CLOSED") {
      return NextResponse.json({
        availableSlots: [],
        message:
          businessHour.reason ||
          "The salon is closed on this date.",
      });
    }

    // =====================================================
    // DETERMINE OPEN / CLOSE TIME
    // =====================================================

    let openTime;
    let closeTime;

    if (businessHour.type === "FULL_DAY") {
      openTime = "00:00";
      closeTime = "23:59";
    } else {
      openTime = normalizeTime(
        businessHour.openTime
      );

      closeTime = normalizeTime(
        businessHour.closeTime
      );
    }

    // =====================================================
    // INVALID BUSINESS HOURS
    // =====================================================

    if (!openTime || !closeTime) {
      return NextResponse.json({
        availableSlots: [],
        message:
          "Business hours are not properly configured.",
      });
    }

    // =====================================================
    // CONVERT OPEN / CLOSE TO MINUTES
    // =====================================================

    const openMinutes =
      timeToMinutes(openTime);

    const closeMinutes =
      timeToMinutes(closeTime);

    if (
      openMinutes === null ||
      closeMinutes === null
    ) {
      return NextResponse.json({
        availableSlots: [],
        message:
          "Invalid business hours configuration.",
      });
    }

    // =====================================================
    // SERVICE DURATION
    // =====================================================

    const serviceDuration =
      Number(service.duration);

    if (
      !Number.isFinite(serviceDuration) ||
      serviceDuration <= 0
    ) {
      return NextResponse.json({
        availableSlots: [],
        message:
          "Service duration is not properly configured.",
      });
    }

    // =====================================================
    // SLOT INTERVAL
    // =====================================================

    const intervalMinutes = 15;

    // =====================================================
    // MINIMUM SLOT
    // =====================================================

    let minimumSlotMinutes =
      openMinutes;

    if (date === pakistanToday) {
      const pakistanTime =
        new Intl.DateTimeFormat(
          "en-GB",
          {
            timeZone: "Asia/Karachi",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        ).format(new Date());

      const [
        currentHour,
        currentMinute,
      ] = pakistanTime
        .split(":")
        .map(Number);

      const currentMinutes =
        currentHour * 60 +
        currentMinute;

      // Round up to next 15-minute slot
      minimumSlotMinutes =
        Math.ceil(
          currentMinutes /
            intervalMinutes
        ) * intervalMinutes;

      // Never before salon opening
      minimumSlotMinutes =
        Math.max(
          minimumSlotMinutes,
          openMinutes
        );

      console.log(
        "CURRENT PAKISTAN TIME:",
        pakistanTime
      );

      console.log(
        "CURRENT MINUTES:",
        currentMinutes
      );

      console.log(
        "MINIMUM SLOT:",
        minutesToTime(
          minimumSlotMinutes
        )
      );
    }

    // =====================================================
    // GET STAFF APPOINTMENTS
    // =====================================================

    const staffWhereClause = {
      date: bookingDate,

      status: {
        in: [
          "PENDING",
          "CONFIRMED",
        ],
      },
    };

    // -----------------------------------------------------
    // SELECTED STAFF
    // -----------------------------------------------------
    //
    // Selected staff ki appointments block hongi.
    //
    // staffId = null wali appointments bhi block hongi
    // kyun ke wo abhi kisi staff ko assign nahi hui.
    //
    // -----------------------------------------------------

    if (staffId) {
      staffWhereClause.OR = [
        {
          staffId: staffId,
        },
        {
          staffId: null,
        },
      ];
    }

    const staffAppointments =
      await prisma.appointment.findMany({
        where: staffWhereClause,

        select: {
          time: true,
          endTime: true,
        },
      });

    // =====================================================
    // GET CURRENT CUSTOMER APPOINTMENTS
    // =====================================================
    //
    // Customer ki apni PENDING / CONFIRMED appointment
    // bhi uske liye slot block karegi.
    //
    // =====================================================

    const customerAppointments =
      await prisma.appointment.findMany({
        where: {
          customerId: customerId,

          date: bookingDate,

          status: {
            in: [
              "PENDING",
              "CONFIRMED",
            ],
          },
        },

        select: {
          time: true,
          endTime: true,
        },
      });

    // =====================================================
    // COMBINE APPOINTMENTS
    // =====================================================

    const existingAppointments = [
      ...staffAppointments,
      ...customerAppointments,
    ];

    console.log(
      "================================="
    );

    console.log(
      "STAFF APPOINTMENTS:",
      staffAppointments
    );

    console.log(
      "CUSTOMER APPOINTMENTS:",
      customerAppointments
    );

    console.log(
      "ALL BLOCKED APPOINTMENTS:",
      existingAppointments
    );

    console.log(
      "================================="
    );

    // =====================================================
    // GENERATE AVAILABLE SLOTS
    // =====================================================

    const availableSlots = [];

    for (
      let minutes = minimumSlotMinutes;
      minutes <= closeMinutes;
      minutes += intervalMinutes
    ) {
      // ---------------------------------------------------
      // SLOT START
      // ---------------------------------------------------

      const slotStartTime =
        minutesToTime(minutes);

      // ---------------------------------------------------
      // SLOT END
      // ---------------------------------------------------

      const slotEndMinutes =
        minutes +
        serviceDuration;

      const slotEndTime =
        minutesToTime(
          slotEndMinutes
        );

      // ---------------------------------------------------
      // SERVICE MUST FINISH BEFORE CLOSING
      // ---------------------------------------------------

      if (
        slotEndMinutes >
        closeMinutes
      ) {
        continue;
      }

      // ---------------------------------------------------
      // TODAY EXTRA SAFETY CHECK
      // ---------------------------------------------------

      if (
        date === pakistanToday
      ) {
        const pakistanTime =
          new Intl.DateTimeFormat(
            "en-GB",
            {
              timeZone:
                "Asia/Karachi",

              hour: "2-digit",
              minute: "2-digit",

              hour12: false,
            }
          ).format(new Date());

        const [
          currentHour,
          currentMinute,
        ] = pakistanTime
          .split(":")
          .map(Number);

        const currentMinutes =
          currentHour * 60 +
          currentMinute;

        if (
          minutes <=
          currentMinutes
        ) {
          continue;
        }
      }

      // ---------------------------------------------------
      // CHECK APPOINTMENT CONFLICT
      // ---------------------------------------------------

      let hasConflict = false;

      for (
        const existing of
          existingAppointments
      ) {
        if (!existing.endTime) {
          continue;
        }

        const existingStartMinutes =
          timeToMinutes(
            existing.time
          );

        const existingEndMinutes =
          timeToMinutes(
            existing.endTime
          );

        if (
          existingStartMinutes ===
            null ||
          existingEndMinutes ===
            null
        ) {
          continue;
        }

        // -------------------------------------------------
        // OVERLAP CHECK
        // -------------------------------------------------

        if (
          minutes <
            existingEndMinutes &&
          slotEndMinutes >
            existingStartMinutes
        ) {
          hasConflict = true;
          break;
        }
      }

      // ---------------------------------------------------
      // ADD AVAILABLE SLOT
      // ---------------------------------------------------

      if (!hasConflict) {
        availableSlots.push({
          time: slotStartTime,
          endTime: slotEndTime,
        });
      }
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    console.log(
      "AVAILABLE SLOTS:",
      availableSlots
    );

    return NextResponse.json({
      availableSlots,
    });
  } catch (error) {
    console.error(
      "GET AVAILABLE SLOTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to get available slots",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// NORMALIZE TIME
// =====================================================

function normalizeTime(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, 5);
}

// =====================================================
// TIME TO MINUTES
// =====================================================

function timeToMinutes(timeStr) {
  if (!timeStr) {
    return null;
  }

  const normalized =
    normalizeTime(timeStr);

  const parts =
    normalized.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const hours =
    Number(parts[0]);

  const minutes =
    Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return (
    hours * 60 +
    minutes
  );
}

// =====================================================
// MINUTES TO TIME
// =====================================================

function minutesToTime(totalMinutes) {
  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}`;
}