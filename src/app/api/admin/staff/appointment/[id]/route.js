import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    // ==========================
    // Authentication
    // ==========================
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

    // ==========================
    // GET APPOINTMENT ID
    // ==========================
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // ==========================
    // FETCH APPOINTMENT
    // ==========================
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        staffId: decoded.id,
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
            duration: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // ==========================
    // NOT FOUND
    // ==========================
    if (!appointment) {
      return NextResponse.json(
        {
          message:
            "Appointment not found or you are not assigned to this appointment.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // SUCCESS
    // ==========================
    return NextResponse.json(appointment);
  } catch (error) {
    console.error(
      "STAFF APPOINTMENT DETAILS ERROR:",
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
// CONFIRM / REJECT APPOINTMENT
// =====================================================

export async function PATCH(request, { params }) {
  try {
    // ==========================
    // Authentication
    // ==========================
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

    // ==========================
    // GET APPOINTMENT ID
    // ==========================
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // ==========================
    // GET REQUEST BODY
    // ==========================
    const body = await request.json();

    const { status } = body;

    if (!["CONFIRMED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          message:
            "Invalid status. Only CONFIRMED or REJECTED is allowed.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // CHECK APPOINTMENT
    // ==========================
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        staffId: decoded.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          message:
            "Appointment not found or you are not assigned to this appointment.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // ONLY PENDING CAN BE ACCEPTED
    // ==========================
    if (appointment.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            `Appointment is already ${appointment.status}.`,
        },
        { status: 409 }
      );
    }

    // ==========================
    // UPDATE STATUS
    // ==========================
    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });

    // ==========================
    // SUCCESS
    // ==========================
    return NextResponse.json({
      message:
        status === "CONFIRMED"
          ? "Appointment confirmed successfully."
          : "Appointment rejected successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(
      "STAFF APPOINTMENT STATUS UPDATE ERROR:",
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