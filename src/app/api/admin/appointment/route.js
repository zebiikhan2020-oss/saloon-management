import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// ================================
// GET ADMIN APPOINTMENTS
// ================================
export async function GET(request) {
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

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }
    // =====================================================
// AUTO REJECT EXPIRED PENDING APPOINTMENTS
// =====================================================

const now = new Date();

const pendingAppointments =
  await prisma.appointment.findMany({
    where: {
      status: "PENDING",
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  customer: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  customer: {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  service: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {},

        status && status !== "ALL"
          ? {
              status: status,
            }
          : {},
      ],
    };

    const appointments =
      await prisma.appointment.findMany({
        where,

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          service: {
            include: {
              category: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });
      const appointmentsWithAvailability = await Promise.all(
  appointments.map(async (appointment) => {
    const appointmentDate = new Date(appointment.date);

    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

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
      dayNames[appointmentDate.getDay()];

    const staffList = await prisma.user.findMany({
      where: {
        role: "STAFF",
        isApproved: true,
        isEmailVerified: true,
      },
      select: {
        id: true,
      },
    });

    const unavailableStaffIds = [];

    for (const staff of staffList) {
      const approvedLeave =
        await prisma.leaveRequest.findFirst({
          where: {
            staffId: staff.id,
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
        unavailableStaffIds.push(staff.id);
        continue;
      }

      const absentAttendance =
        await prisma.attendance.findFirst({
          where: {
            staffId: staff.id,
            status: "ABSENT",
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

      if (absentAttendance) {
        unavailableStaffIds.push(staff.id);
        continue;
      }

      const staffSchedule =
        await prisma.staffSchedule.findFirst({
          where: {
            staffId: staff.id,
            day: selectedDay,
          },
        });

      if (
        staffSchedule &&
        staffSchedule.status === "OFF"
      ) {
        unavailableStaffIds.push(staff.id);
      }
    }

    return {
      ...appointment,
      unavailableStaffIds,
    };
  })
);

   return NextResponse.json(appointmentsWithAvailability, {
  status: 200,
});
  } catch (error) {
    console.error(
      "ADMIN APPOINTMENT ERROR:",
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

// ================================
// PUT
// ASSIGN STAFF / CHANGE STATUS
// ================================
export async function PUT(request) {
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

    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      appointmentId,
      staffId,
      status,
    } = body;

    // =====================================================
    // CASE 1
    // CHANGE APPOINTMENT STATUS
    // =====================================================

    if (appointmentId && status) {
      const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CANCELLED",
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
              },
            },

            staff: {
              select: {
                id: true,
                name: true,
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

      const updatedAppointment =
        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },

          data: {
            status,
          },

          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            service: {
              include: {
                category: true,
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

          title: `Appointment ${status
            .toLowerCase()
            .replace("_", " ")}`,

          message: `Your appointment for ${
            appointment.service?.name || "service"
          } has been ${status.toLowerCase()}.`,

          type: "APPOINTMENT",
           appointmentId: appointment.id,
        },
      });

      // =====================================================
      // STAFF NOTIFICATION
      // Only if appointment has staff
      // =====================================================

      if (appointment.staffId) {
        await prisma.notification.create({
          data: {
            userId: appointment.staffId,

            title: "Appointment Updated",

            message: `Appointment for ${
              appointment.customer?.name || "customer"
            } has been ${status.toLowerCase()} by admin.`,

            type: "APPOINTMENT",
          },
        });
      }

      return NextResponse.json(
        {
          message:
            `Appointment ${status.toLowerCase()} successfully`,

          appointment: updatedAppointment,
        },
        {
          status: 200,
        }
      );
    }

    // =====================================================
    // CASE 2
    // ASSIGN STAFF
    // =====================================================

    if (appointmentId && staffId) {
      const staff =
        await prisma.user.findFirst({
          where: {
            id: staffId,
            role: "STAFF",
            isApproved: true,
            isEmailVerified: true,
          },
        });

      if (!staff) {
        return NextResponse.json(
          {
            message:
              "Invalid or unapproved staff",
          },
          {
            status: 404,
          }
        );
      }

            // =====================================================
      // CHECK STAFF AVAILABILITY FOR APPOINTMENT DATE
      // =====================================================

      const appointmentForAvailability =
        await prisma.appointment.findUnique({
          where: {
            id: appointmentId,
          },
          select: {
            date: true,
          },
        });

      if (!appointmentForAvailability) {
        return NextResponse.json(
          {
            message: "Appointment not found",
          },
          {
            status: 404,
          }
        );
      }

      const appointmentDate =
        new Date(appointmentForAvailability.date);

      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(appointmentDate);
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
              lte: endOfDay,
            },

            endDate: {
              gte: startOfDay,
            },
          },
        });

      if (approvedLeave) {
        return NextResponse.json(
          {
            message:
              "This staff member is on approved leave on the appointment date. Please select another staff.",
          },
          {
            status: 400,
          }
        );
      }

      // =====================================================
      // CHECK ABSENT ATTENDANCE
      // =====================================================

      const absentAttendance =
        await prisma.attendance.findFirst({
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
        return NextResponse.json(
          {
            message:
              "This staff member is marked absent on the appointment date. Please select another staff.",
          },
          {
            status: 400,
          }
        );
      }

      // =====================================================
      // CHECK STAFF WEEKLY SCHEDULE
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
        dayNames[appointmentDate.getDay()];

      const staffSchedule =
        await prisma.staffSchedule.findFirst({
          where: {
            staffId,
            day: selectedDay,
          },
        });

      if (
        staffSchedule &&
        staffSchedule.status === "OFF"
      ) {
        return NextResponse.json(
          {
            message:
              `This staff member is off on ${selectedDay}. Please select another staff.`,
          },
          {
            status: 400,
          }
        );
      }

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
              },
            },

            service: {
              select: {
                name: true,
              },
            },

            staff: {
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

      const updatedAppointment =
        await prisma.appointment.update({
          where: {
            id: appointmentId,
          },

          data: {
            staffId,
          },

          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

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
      // STAFF NOTIFICATION
      // =====================================================

      await prisma.notification.create({
        data: {
          userId: staffId,

          title: "New Appointment Assigned",

          message: `You have been assigned an appointment for ${
            appointment.customer?.name || "customer"
          } - ${
            appointment.service?.name || "service"
          } on ${
            new Date(appointment.date)
              .toISOString()
              .split("T")[0]
          } at ${appointment.time}.`,

          type: "APPOINTMENT",
        },
      });

      return NextResponse.json(
        {
          message:
            "Staff assigned successfully",

          appointment: updatedAppointment,
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
          "Appointment ID and Staff ID or Status are required",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN APPOINTMENT PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}