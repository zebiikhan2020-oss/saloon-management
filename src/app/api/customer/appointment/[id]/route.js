import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =======================
// CANCEL APPOINTMENT
// =======================

export async function PATCH(request, { params }) {
  try {
    // =====================================================
    // GET APPOINTMENT ID
    // =====================================================

    const { id } = await params;

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

    // =====================================================
    // ONLY CUSTOMER CAN CANCEL
    // =====================================================

    if (decoded.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          message:
            "Only customers can cancel appointments",
        },
        {
          status: 403,
        }
      );
    }

    const customerId =
      decoded.id ||
      decoded.userId ||
      decoded.customerId;

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Customer id not found",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // GET APPOINTMENT
    // =====================================================

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id,
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

          staff: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    // =====================================================
    // APPOINTMENT NOT FOUND
    // =====================================================

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
    // OWNERSHIP CHECK
    // =====================================================

    if (appointment.customerId !== customerId) {
      return NextResponse.json(
        {
          message:
            "You cannot cancel this appointment",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // ALREADY CANCELLED
    // =====================================================

    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        {
          message:
            "Appointment already cancelled",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CONFIRMED APPOINTMENT
    // CUSTOMER CANNOT CANCEL AFTER ADMIN APPROVAL
    // =====================================================

    if (appointment.status === "CONFIRMED") {
      return NextResponse.json(
        {
          message:
            "Confirmed appointment cannot be cancelled. Please contact the salon.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // COMPLETED APPOINTMENT
    // =====================================================

    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        {
          message:
            "Completed appointment cannot be cancelled",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // REJECTED APPOINTMENT
    // =====================================================

    if (appointment.status === "REJECTED") {
      return NextResponse.json(
        {
          message:
            "Rejected appointment cannot be cancelled",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ONLY PENDING APPOINTMENT CAN BE CANCELLED
    // =====================================================

    if (appointment.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "This appointment cannot be cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // UPDATE APPOINTMENT STATUS
    // =====================================================

    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id,
        },

        data: {
          status: "CANCELLED",
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

          staff: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    // =====================================================
    // GET ADMINS
    // =====================================================

    const admins =
      await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },

        select: {
          id: true,
        },
      });

    // =====================================================
    // ADMIN NOTIFICATION
    // CUSTOMER CANCELLED APPOINTMENT
    // =====================================================

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,

          title: "Appointment Cancelled",

          message: `${
            appointment.customer?.name ||
            "A customer"
          } cancelled the appointment for ${
            appointment.service?.name ||
            "service"
          } on ${
            new Date(appointment.date)
              .toISOString()
              .split("T")[0]
          } at ${appointment.time}.`,

          type: "APPOINTMENT",

          appointmentId: appointment.id,
        })),
      });
    }

    // =====================================================
    // STAFF NOTIFICATION
    // IF STAFF IS ASSIGNED
    // =====================================================

    if (appointment.staffId) {
      await prisma.notification.create({
        data: {
          userId: appointment.staffId,

          title: "Appointment Cancelled",

          message: `${
            appointment.customer?.name ||
            "A customer"
          } cancelled the appointment for ${
            appointment.service?.name ||
            "service"
          } on ${
            new Date(appointment.date)
              .toISOString()
              .split("T")[0]
          } at ${appointment.time}.`,

          type: "APPOINTMENT",

          appointmentId: appointment.id,
        },
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        message:
          "Appointment cancelled successfully",

        appointment: updatedAppointment,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CANCEL APPOINTMENT ERROR:",
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