import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    // =====================================================
    // NEXT.JS 16
    // params is a Promise
    // =====================================================

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Leave request ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body = await request.json();

    const { status } = body;

    // =====================================================
    // VALIDATE STATUS
    // =====================================================

    if (
      !status ||
      !["APPROVED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status must be APPROVED or REJECTED",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // FIND LEAVE REQUEST
    // =====================================================

    const existingLeave =
      await prisma.leaveRequest.findUnique({
        where: {
          id,
        },
      });

    if (!existingLeave) {
      return NextResponse.json(
        {
          success: false,
          message: "Leave request not found",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // UPDATE LEAVE
    // =====================================================

    const leaveRequest =
      await prisma.leaveRequest.update({
        where: {
          id,
        },

        data: {
          status,
        },

        include: {
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
     // =====================================================
// HANDLE EXISTING APPOINTMENTS FOR APPROVED LEAVE
// =====================================================

if (status === "APPROVED") {
  const affectedAppointments =
    await prisma.appointment.findMany({
      where: {
        staffId: existingLeave.staffId,

        date: {
          gte: existingLeave.startDate,
          lte: existingLeave.endDate,
        },

        status: {
          in: ["PENDING", "CONFIRMED"],
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
  // REMOVE STAFF FROM EXISTING APPOINTMENTS
  // ===================================================

  if (affectedAppointments.length > 0) {
    await prisma.appointment.updateMany({
      where: {
        id: {
          in: affectedAppointments.map(
            (appointment) => appointment.id
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
          userId: appointment.customerId,

          title: "Staff Unavailable",

          message: `Your appointment for ${
            appointment.service?.name || "your service"
          } needs staff reassignment because the selected staff member is on approved leave.`,

          type: "APPOINTMENT",

          appointmentId: appointment.id,
        })
      ),
    });
  }
}
    // =====================================================
    // STAFF NOTIFICATION
    // =====================================================

    await prisma.notification.create({
      data: {
        userId: existingLeave.staffId,

        title:
          status === "APPROVED"
            ? "Leave Request Approved"
            : "Leave Request Rejected",

        message:
          status === "APPROVED"
            ? `Your leave request from ${new Date(
                existingLeave.startDate
              ).toLocaleDateString()} to ${new Date(
                existingLeave.endDate
              ).toLocaleDateString()} has been approved.`
            : `Your leave request from ${new Date(
                existingLeave.startDate
              ).toLocaleDateString()} to ${new Date(
                existingLeave.endDate
              ).toLocaleDateString()} has been rejected.`,

        type: "LEAVE",
      },
    });

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          status === "APPROVED"
            ? "Leave request approved successfully"
            : "Leave request rejected successfully",

        leaveRequest,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE LEAVE REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update leave request",
      },
      {
        status: 500,
      }
    );
  }
}