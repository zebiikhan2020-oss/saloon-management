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

    // ==========================
    // Total Appointments
    // ==========================
    const totalAppointments = await prisma.appointment.count();

    // ==========================
    // Appointments by Status
    // ==========================
    const completedAppointments = await prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    });

    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: "PENDING",
      },
    });

    const confirmedAppointments = await prisma.appointment.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const cancelledAppointments = await prisma.appointment.count({
      where: {
        status: "CANCELLED",
      },
    });

    const rejectedAppointments = await prisma.appointment.count({
      where: {
        status: "REJECTED",
      },
    });

    // ==========================
    // Total Customers
    // ==========================
    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    // ==========================
    // Total Staff
    // ==========================
    const totalStaff = await prisma.user.count({
      where: {
        role: "STAFF",
      },
    });

    // ==========================
    // Total Services
    // ==========================
    const totalServices = await prisma.service.count();

    // ==========================
    // Reviews and Ratings
    // ==========================
    const appointmentReviews = await prisma.appointmentReview.findMany({
      include: {
        appointment: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalReviews = appointmentReviews.length;

    const averageRating = totalReviews > 0
      ? appointmentReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // ==========================
    // Weekly Statistics (Last 7 days)
    // ==========================
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by day for weekly chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayAppointments = weeklyAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= date && aptDate < nextDate;
      });

      weeklyData.push({
        date: date.toLocaleDateString("default", { month: "short", day: "numeric" }),
        count: dayAppointments.length,
        completed: dayAppointments.filter(apt => apt.status === "COMPLETED").length,
        pending: dayAppointments.filter(apt => apt.status === "PENDING").length,
      });
    }

    // ==========================
    // Monthly Statistics (Last 30 days)
    // ==========================
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by week for monthly chart
    const monthlyData = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekAppointments = monthlyAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekStart && aptDate < weekEnd;
      });

      monthlyData.push({
        week: `Week ${5 - i}`,
        count: weekAppointments.length,
        completed: weekAppointments.filter(apt => apt.status === "COMPLETED").length,
        pending: weekAppointments.filter(apt => apt.status === "PENDING").length,
      });
    }

    return NextResponse.json({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      rejectedAppointments,
      totalCustomers,
      totalStaff,
      totalServices,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      weeklyData,
      monthlyData,
    });

  } catch (error) {
    console.log("ADMIN ANALYTICS ERROR:", error);

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
