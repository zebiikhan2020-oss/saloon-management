import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =====================================================
// GET STAFF APPOINTMENTS
// =====================================================

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

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }


    if (decoded.role !== "STAFF") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }
    // =====================================================
// AUTO REJECT EXPIRED PENDING APPOINTMENTS
// =====================================================

const now = new Date();

const pendingAppointments = await prisma.appointment.findMany({
  where: {
    status: "PENDING",
    OR: [
      {
        staffId: decoded.id,
      },
      {
        staffId: null,
      },
    ],
  },
  select: {
    id: true,
    customerId: true,
    date: true,
    time: true,
    service: {
      select: {
        name: true,
      },
    },
  },
});

for (const appointment of pendingAppointments) {
  const appointmentDate = new Date(appointment.date);

  const [hour, minute] = appointment.time
    .split(":")
    .map(Number);

  appointmentDate.setHours(hour, minute, 0, 0);

  // Appointment time has passed
  if (appointmentDate <= now) {
    await prisma.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    // Customer notification
    await prisma.notification.create({
      data: {
        userId: appointment.customerId,

        title: "Appointment Automatically Rejected",

        message: `Your appointment for ${
          appointment.service?.name || "service"
        } at ${
          appointment.time
        } was automatically rejected because the appointment time passed without approval.`,

        type: "APPOINTMENT",

        appointmentId: appointment.id,
      },
    });
  }
}

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          {
            staffId: decoded.id,
          },
          {
            staffId: null,
          },
        ],
      },

      include: {
        service: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "GET STAFF APPOINTMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// UPDATE APPOINTMENT STATUS
// ACCEPT / REJECT / COMPLETE
// =====================================================

export async function PATCH(request) {
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

    if (decoded.role !== "STAFF") {
      return NextResponse.json(
        {
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body = await request.json();

    const appointmentId = body?.appointmentId;
    const status = body?.status;

    console.log("STAFF PATCH BODY:", {
      appointmentId,
      status,
    });

    if (!appointmentId || !status) {
      return NextResponse.json(
        {
          message:
            "Appointment ID and status are required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ALLOWED STATUS
    // =====================================================

    const allowedStatuses = [
      "CONFIRMED",
      "REJECTED",
      "COMPLETED",
      "IN_PROGRESS",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid appointment status",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // FIND APPOINTMENT
    // =====================================================

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          message: "Appointment not found",
        },
        {
          status: 404,
        }
      );
    }
    // =====================================================
// AUTO REJECT EXPIRED PENDING APPOINTMENT
// =====================================================

if (appointment.status === "PENDING") {
  const appointmentDate = new Date(appointment.date);

  const [hour, minute] = appointment.time
    .split(":")
    .map(Number);

  appointmentDate.setHours(hour, minute, 0, 0);

  const now = new Date();

  if (appointmentDate <= now) {
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.notification.create({
      data: {
        userId: appointment.customerId,

        title: "Appointment Automatically Rejected",

        message: `Your appointment for ${
          appointment.service?.name || "service"
        } at ${
          appointment.time
        } was automatically rejected because the appointment time passed without approval.`,

        type: "APPOINTMENT",

        appointmentId: appointment.id,
      },
    });

    return NextResponse.json(
      {
        message:
          "Appointment time has passed. The appointment was automatically rejected.",
      },
      {
        status: 400,
      }
    );
  }
}
    // =====================================================
    // STAFF OWNERSHIP
    // =====================================================

    // CONFIRMED:
    // Staff can accept an unassigned appointment.
    //
    // REJECTED / COMPLETED:
    // console.log("========== OWNERSHIP DEBUG ==========");
console.log("REQUESTED STATUS:", status);
console.log("APPOINTMENT ID:", appointment.id);
console.log("APPOINTMENT STAFF ID:", appointment.staffId);
console.log("LOGGED IN STAFF ID:", decoded.id);
console.log("APPOINTMENT STATUS:", appointment.status);
console.log("======================================");


    if (
      status !== "CONFIRMED" &&
      appointment.staffId !== decoded.id
    ) {
      return NextResponse.json(
        {
          message:
            "You can only manage appointments assigned to you",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // CONFIRM / ACCEPT
    // =====================================================

   if (status === "CONFIRMED") {
  // =====================================================
  // ATOMIC ACCEPT
  // Only ONE staff can accept an unassigned appointment
  // =====================================================

 const result = await prisma.appointment.updateMany({
  where: {
    id: appointmentId,
    status: "PENDING",

    OR: [
      {
        staffId: null,
      },
      {
        staffId: decoded.id,
      },
    ],
  },

  data: {
    status: "CONFIRMED",
    staffId: decoded.id,
  },
});

  // =====================================================
  // APPOINTMENT WAS ALREADY TAKEN
  // =====================================================

  if (result.count === 0) {
    const latestAppointment =
      await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },

        select: {
          staffId: true,
          status: true,
        },
      });

    if (
      latestAppointment?.staffId &&
      latestAppointment.staffId !== decoded.id
    ) {
      return NextResponse.json(
        {
          message:
            "This appointment has already been accepted by another staff member.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "This appointment is no longer available for acceptance.",
      },
      {
        status: 409,
      }
    );
  }

  // =====================================================
  // GET UPDATED APPOINTMENT
  // =====================================================

  const updatedAppointment =
    await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  // =====================================================
  // CUSTOMER NOTIFICATION
  // =====================================================

  await prisma.notification.create({
    data: {
      userId: appointment.customerId,

      title: "Appointment Accepted",

      message: `Your appointment for ${
        appointment.service?.name || "service"
      } on ${
        new Date(appointment.date)
          .toISOString()
          .split("T")[0]
      } at ${
        appointment.time
      } has been accepted by the staff.`,

      type: "APPOINTMENT",

      appointmentId: appointment.id,
    },
  });

  return NextResponse.json(
    {
      message: "Appointment accepted successfully",
      updatedAppointment,
    },
    {
      status: 200,
    }
  );
}

    // =====================================================
    // REJECT
    // =====================================================

    if (status === "REJECTED") {
      const updatedAppointment =
        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },

          data: {
            status: "REJECTED",
          },
        });

      // ===================================================
      // CUSTOMER NOTIFICATION
      // ===================================================

      await prisma.notification.create({
        data: {
          userId: appointment.customerId,

          title: "Appointment Rejected",

          message: `Your appointment for ${
            appointment.service?.name || "service"
          } on ${
            new Date(appointment.date)
              .toISOString()
              .split("T")[0]
          } at ${
            appointment.time
          } has been rejected by the staff.`,

          type: "APPOINTMENT",

          appointmentId: appointment.id,
        },
      });

      return NextResponse.json(
        {
          message:
            "Appointment rejected successfully",

          updatedAppointment,
        },
        {
          status: 200,
        }
      );
    }

    // =====================================================
// START APPOINTMENT / IN PROGRESS
// =====================================================

// =====================================================
// START APPOINTMENT / IN PROGRESS
// =====================================================

if (status === "IN_PROGRESS") {
   console.log("=================================");
  console.log("APPOINTMENT DATE:", appointment.date);
  console.log("APPOINTMENT TIME:", appointment.time);
  console.log("APPOINTMENT STAFF ID:", appointment.staffId);
  console.log("LOGGED IN STAFF ID:", decoded.id);
  console.log("APPOINTMENT STATUS:", appointment.status);
  console.log("=================================");

  // ---------------------------------------------------
  // APPOINTMENT MUST BE CONFIRMED
  // ---------------------------------------------------

  if (appointment.status !== "CONFIRMED") {
    return NextResponse.json(
      {
        message:
          "Only confirmed appointments can be started.",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------
  // APPOINTMENT MUST BELONG TO THIS STAFF
  // ---------------------------------------------------

  if (appointment.staffId !== decoded.id) {
    return NextResponse.json(
      {
        message:
          "You can only start your own appointments.",
      },
      {
        status: 403,
      }
    );
  }

  // ---------------------------------------------------
  // GET CURRENT PAKISTAN DATE + TIME
  // ---------------------------------------------------

  const pakistanNow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  // ---------------------------------------------------
  // GET APPOINTMENT DATE
  // ---------------------------------------------------

  const appointmentDate = new Date(appointment.date);

  if (Number.isNaN(appointmentDate.getTime())) {
    return NextResponse.json(
      {
        message: "Invalid appointment date.",
      },
      {
        status: 400,
      }
    );
  }

  // Convert appointment date to Pakistan date
  const appointmentDatePK = new Date(
    appointmentDate.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  // ---------------------------------------------------
  // GET APPOINTMENT TIME
  // ---------------------------------------------------

  const timeString = String(appointment.time || "")
    .trim()
    .toUpperCase();

  if (!timeString) {
    return NextResponse.json(
      {
        message: "Appointment time is missing.",
      },
      {
        status: 400,
      }
    );
  }

  let hours;
  let minutes;

  // ---------------------------------------------------
  // 12-HOUR FORMAT
  // Example: 03:30 PM
  // ---------------------------------------------------

  if (
    timeString.includes("AM") ||
    timeString.includes("PM")
  ) {
    const match = timeString.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

    if (!match) {
      return NextResponse.json(
        {
          message:
            "Invalid appointment time format.",
        },
        {
          status: 400,
        }
      );
    }

    hours = Number(match[1]);
    minutes = Number(match[2]);

    const modifier = match[3];

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
  }

  // ---------------------------------------------------
  // 24-HOUR FORMAT
  // Example: 09:30 / 14:30
  // ---------------------------------------------------

  else {
    const match = timeString.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (!match) {
      return NextResponse.json(
        {
          message:
            "Invalid appointment time format.",
        },
        {
          status: 400,
        }
      );
    }

    hours = Number(match[1]);
    minutes = Number(match[2]);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }
  }

  // ---------------------------------------------------
  // COMPARE DATE
  // ---------------------------------------------------

  const currentYear = pakistanNow.getFullYear();
  const currentMonth = pakistanNow.getMonth();
  const currentDay = pakistanNow.getDate();

  const appointmentYear =
    appointmentDatePK.getFullYear();

  const appointmentMonth =
    appointmentDatePK.getMonth();

  const appointmentDay =
    appointmentDatePK.getDate();

  // ---------------------------------------------------
  // FUTURE DATE
  // ---------------------------------------------------

  if (
    appointmentYear > currentYear ||
    (
      appointmentYear === currentYear &&
      appointmentMonth > currentMonth
    ) ||
    (
      appointmentYear === currentYear &&
      appointmentMonth === currentMonth &&
      appointmentDay > currentDay
    )
  ) {
    return NextResponse.json(
      {
        message:
          "You cannot start the appointment before its scheduled date and time.",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------
  // PAST DATE
  // ---------------------------------------------------

  const appointmentDateOnly =
    new Date(
      appointmentYear,
      appointmentMonth,
      appointmentDay
    );

  const currentDateOnly =
    new Date(
      currentYear,
      currentMonth,
      currentDay
    );

  if (appointmentDateOnly < currentDateOnly) {
    // Past appointment date — time has already arrived
    // so starting is allowed.
  }

  // ---------------------------------------------------
  // SAME DATE → CHECK TIME
  // ---------------------------------------------------

  const sameDate =
    appointmentYear === currentYear &&
    appointmentMonth === currentMonth &&
    appointmentDay === currentDay;

  if (sameDate) {
    const currentMinutes =
      pakistanNow.getHours() * 60 +
      pakistanNow.getMinutes();

    const appointmentMinutes =
      hours * 60 + minutes;

    // Appointment time has NOT arrived yet
    if (currentMinutes < appointmentMinutes) {
      return NextResponse.json(
        {
          message:
            "You cannot start the appointment before its scheduled time.",
        },
        {
          status: 400,
        }
      );
    }
  }

  // ---------------------------------------------------
  // START APPOINTMENT
  // ---------------------------------------------------

  const updatedAppointment =
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },

      data: {
        status: "IN_PROGRESS",
      },
    });

  // ---------------------------------------------------
  // CUSTOMER NOTIFICATION
  // ---------------------------------------------------

  await prisma.notification.create({
    data: {
      userId: appointment.customerId,

      title: "Appointment Started",

      message: `Your appointment for ${
        appointment.service?.name || "service"
      } has now started.`,

      type: "APPOINTMENT",

      appointmentId: appointment.id,
    },
  });

  return NextResponse.json(
    {
      message:
        "Appointment started successfully.",
      updatedAppointment,
    },
    {
      status: 200,
    }
  );
}

    // =====================================================
    // COMPLETE
    // =====================================================

  
// =====================================================
// COMPLETE
// =====================================================

if (status === "COMPLETED") {
  // ---------------------------------------------------
  // ONLY CONFIRMED APPOINTMENT CAN BE COMPLETED
  // ---------------------------------------------------

 if (
  appointment.status !== "CONFIRMED" &&
  appointment.status !== "IN_PROGRESS"
) {
  return NextResponse.json(
    {
      message:
        "Only confirmed or in-progress appointments can be completed.",
    },
    {
      status: 400,
    }
  );
}

  // ---------------------------------------------------
  // APPOINTMENT MUST BELONG TO THIS STAFF
  // ---------------------------------------------------

  if (appointment.staffId !== decoded.id) {
    return NextResponse.json(
      {
        message: "You can only complete your own appointments.",
      },
      {
        status: 403,
      }
    );
  }

  // ---------------------------------------------------
  // GET APPOINTMENT DATE
  // ---------------------------------------------------

  const appointmentDate = new Date(appointment.date);

  if (Number.isNaN(appointmentDate.getTime())) {
    return NextResponse.json(
      {
        message: "Invalid appointment date.",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------
  // GET APPOINTMENT TIME
  // ---------------------------------------------------

  const timeString = String(appointment.time || "")
    .trim()
    .toUpperCase();

  if (!timeString) {
    return NextResponse.json(
      {
        message: "Appointment time is missing.",
      },
      {
        status: 400,
      }
    );
  }

  let hours;
  let minutes;

  // ---------------------------------------------------
  // 12-HOUR FORMAT
  // Example: 11:30 AM / 11:30 PM
  // ---------------------------------------------------

  if (timeString.includes("AM") || timeString.includes("PM")) {
    const match = timeString.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

    if (!match) {
      return NextResponse.json(
        {
          message: "Invalid appointment time format.",
        },
        {
          status: 400,
        }
      );
    }

    hours = Number(match[1]);
    minutes = Number(match[2]);

    const modifier = match[3];

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
  }

  // ---------------------------------------------------
  // 24-HOUR FORMAT
  // Example: 09:30 / 14:30 / 23:00
  // ---------------------------------------------------

  else {
    const match = timeString.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (!match) {
      return NextResponse.json(
        {
          message: "Invalid appointment time format.",
        },
        {
          status: 400,
        }
      );
    }

    hours = Number(match[1]);
    minutes = Number(match[2]);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }
  }

  // ===================================================
  // PAKISTAN DATE + TIME
  // ===================================================

  const pakistanNow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  const pakistanAppointmentDate = new Date(
    appointment.date
  );

  const appointmentDatePK = new Date(
    pakistanAppointmentDate.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  // ---------------------------------------------------
  // DATE COMPARISON
  // ---------------------------------------------------

  const currentYear = pakistanNow.getFullYear();
  const currentMonth = pakistanNow.getMonth();
  const currentDay = pakistanNow.getDate();

  const appointmentYear = appointmentDatePK.getFullYear();
  const appointmentMonth = appointmentDatePK.getMonth();
  const appointmentDay = appointmentDatePK.getDate();

  // ---------------------------------------------------
  // FUTURE DATE
  // ---------------------------------------------------

  if (
    appointmentYear > currentYear ||
    (
      appointmentYear === currentYear &&
      appointmentMonth > currentMonth
    ) ||
    (
      appointmentYear === currentYear &&
      appointmentMonth === currentMonth &&
      appointmentDay > currentDay
    )
  ) {
    return NextResponse.json(
      {
        message:
          "This appointment cannot be completed before its scheduled date and time.",
      },
      {
        status: 400,
      }
    );
  }

  // ---------------------------------------------------
  // SAME DATE -> CHECK TIME
  // ---------------------------------------------------

  const sameDate =
    appointmentYear === currentYear &&
    appointmentMonth === currentMonth &&
    appointmentDay === currentDay;

  if (sameDate) {
    const currentMinutes =
      pakistanNow.getHours() * 60 +
      pakistanNow.getMinutes();

    const appointmentMinutes =
      hours * 60 + minutes;

    console.log("=================================");
    console.log("APPOINTMENT TIME:", `${hours}:${minutes}`);
    console.log("CURRENT TIME:", pakistanNow.toTimeString());
    console.log("APPOINTMENT MINUTES:", appointmentMinutes);
    console.log("CURRENT MINUTES:", currentMinutes);
    console.log("=================================");

    // -------------------------------------------------
    // THIS IS THE IMPORTANT CHECK
    // -------------------------------------------------

    if (currentMinutes < appointmentMinutes) {
      return NextResponse.json(
        {
          message:
            "This appointment cannot be completed before its scheduled time.",
        },
        {
          status: 400,
        }
      );
    }
  }

  // ===================================================
  // COMPLETE APPOINTMENT
  // ===================================================

  const updatedAppointment =
    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },

      data: {
        status: "COMPLETED",
      },
    });

  // ===================================================
  // CUSTOMER NOTIFICATION
  // ===================================================

  await prisma.notification.create({
    data: {
      userId: appointment.customerId,

      title: "Appointment Completed",

      message: `Your appointment for ${
        appointment.service?.name || "service"
      } has been completed successfully.`,

      type: "APPOINTMENT",

      appointmentId: appointment.id,
    },
  });

  return NextResponse.json(
    {
      message: "Appointment completed successfully.",
      updatedAppointment,
    },
    {
      status: 200,
    }
  );
}
    // =====================================================
    // INVALID REQUEST
    // =====================================================

    return NextResponse.json(
      {
        message:
          "Invalid appointment request",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "PATCH STAFF APPOINTMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}