import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
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

console.log("STAFF DASHBOARD TOKEN DATA:", decoded);

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
    // Today Date
    // ==========================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ==========================
    // Today's Appointments
    // Dashboard Card
    // ==========================
    const todaysAppointments = await prisma.appointment.count({
      where: {
        staffId: decoded.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // ==========================
    // Pending Appointments
    // Dashboard Card
    // ==========================
    const pendingAppointments = await prisma.appointment.count({
      where: {
        staffId: decoded.id,
        status: "PENDING",
      },
    });

    // ==========================
    // Completed Today
    // Dashboard Card
    // ==========================
    const completedToday = await prisma.appointment.count({
      where: {
        staffId: decoded.id,
        status: "COMPLETED",
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // ==========================
    // Today's Schedule
    // Dashboard Table
    // ==========================
    const todaysSchedule = await prisma.appointment.findMany({
      where: {
        staffId: decoded.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },

      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },

        service: {
          select: {
            name: true,
            duration: true,
          },
        },
      },

      orderBy: {
        time: "asc",
      },
    });

    // ==========================
    // Staff Information
    // Welcome Card
    // ==========================
    const staff = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      staff,
      todaysAppointments,
      pendingAppointments,
      completedToday,
      todaysSchedule,
    });

  } catch (error) {
    console.log("STAFF DASHBOARD ERROR:", error);

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