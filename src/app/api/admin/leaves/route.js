import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");

    // =====================================================
    // AUTO REJECT PENDING LEAVES AFTER 24 HOURS
    // =====================================================

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const expiredLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },

      select: {
        id: true,
        staffId: true,
        startDate: true,
        endDate: true,
      },
    });

    // =====================================================
    // REJECT EXPIRED LEAVES
    // =====================================================

    if (expiredLeaves.length > 0) {
      for (const leave of expiredLeaves) {
        await prisma.leaveRequest.update({
          where: {
            id: leave.id,
          },

          data: {
            status: "REJECTED",
          },
        });

        // =================================================
        // STAFF NOTIFICATION
        // =================================================

        await prisma.notification.create({
          data: {
            userId: leave.staffId,

            title: "Leave Request Auto Rejected",

            message:
              "Your leave request was automatically rejected because it was not reviewed within 24 hours.",

            type: "LEAVE",
          },
        });
      }
    }

    // =====================================================
    // GET LEAVES
    // =====================================================

    const where = {};

    if (staffId) {
      where.staffId = staffId;
    }

    if (status) {
      where.status = status;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,

      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leaves);

  } catch (error) {
    console.log("GET LEAVES ERROR:", error);

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