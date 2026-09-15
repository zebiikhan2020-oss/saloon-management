import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Auto-transition CONFIRMED appointments to IN_PROGRESS when start time arrives
    const confirmedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "CONFIRMED",
      },
      select: {
        id: true,
        time: true,
        date: true,
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
      },
    });

    const now = new Date();

    for (const appointment of confirmedAppointments) {
      const appointmentDate = new Date(appointment.date);
      const [hour, minute] = appointment.time.split(":").map(Number);
      appointmentDate.setHours(hour, minute, 0, 0);

      if (appointmentDate <= now) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: "IN_PROGRESS" },
        });

        await prisma.notification.create({
          data: {
            userId: appointment.customer.id,
            title: "Appointment Started",
            message: `Your appointment for ${appointment.service?.name || "service"} has started.`,
            type: "APPOINTMENT",
            appointmentId: appointment.id,
          },
        });
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"],
        },
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
      orderBy: [
        { time: "asc" },
      ],
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("TODAY'S APPOINTMENTS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
