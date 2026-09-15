import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total appointments
    const totalAppointments = await prisma.appointment.count();

    // Get appointments by status
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

    const completedAppointments = await prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    });

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    // Get total staff
    const totalStaff = await prisma.user.count({
      where: {
        role: "STAFF",
      },
    });

    const totalServices = await prisma.service.count();

    // Get today's attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

   const presentToday = await prisma.attendance.count({
  where: {
    date: {
      gte: today,
      lt: tomorrow,
    },
    status: "PRESENT",
  },
});

const absentToday = await prisma.attendance.count({
  where: {
    date: {
      gte: today,
      lt: tomorrow,
    },
    status: "ABSENT",
  },
});

    // Get leave request stats
    const pendingLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "PENDING",
      },
    });

    const approvedLeaves = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
      },
    });
    const todaysAppointments = await prisma.appointment.findMany({
  where: {
    date: {
      gte: today,
      lt: tomorrow,
    },
  },

  include: {
    customer: {
      select: {
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
        name: true,
      },
    },
  },

  orderBy: {
    time: "asc",
  },
});

    return NextResponse.json({
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalCustomers,
      totalStaff,
       totalServices,
      presentToday,
      absentToday,
      pendingLeaveRequests,
      approvedLeaves,
      todaysAppointments,
    });

  } catch (error) {
    console.log("GET DASHBOARD STATS ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
