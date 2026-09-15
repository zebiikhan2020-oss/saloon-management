import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ==========================================
// GET LEAVE REQUESTS
// ==========================================

export async function GET(request) {
  try {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found in token",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const where = {
      staffId,
    };

    if (status) {
      where.status = status;
    }

    const leaveRequests =
      await prisma.leaveRequest.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      leaveRequests,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(
      "GET LEAVE REQUESTS ERROR:",
      error
    );

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


// ==========================================
// POST LEAVE REQUEST
// ==========================================

export async function POST(request) {
  try {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found in token",
        },
        {
          status: 401,
        }
      );
    }

    const {
      startDate,
      endDate,
      reason,
    } = await request.json();

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (!startDate || !endDate || !reason?.trim()) {
      return NextResponse.json(
        {
          message:
            "Start date, end date and reason are required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // NORMALIZE DATES
    // ==========================================

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        {
          message: "Invalid leave date",
        },
        {
          status: 400,
        }
      );
    }

    // Set selected dates to start of day
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ==========================================
    // PAST DATE CHECK
    // ==========================================

    if (start < today) {
      return NextResponse.json(
        {
          message:
            "Leave cannot be requested for a past date.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // END DATE CHECK
    // ==========================================

    if (end < start) {
      return NextResponse.json(
        {
          message:
            "End date cannot be before start date.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK ATTENDANCE
    // ==========================================

    /*
      If attendance has already been marked
      PRESENT, ABSENT or LEAVE for any date
      inside requested leave period,
      leave request is not allowed.
    */

    const attendanceRecords =
      await prisma.attendance.findMany({
        where: {
          staffId,

          date: {
            gte: start,
            lte: end,
          },

          status: {
            in: [
              "PRESENT",
              "ABSENT",
              "LEAVE",
            ],
          },
        },
      });

    if (attendanceRecords.length > 0) {
      return NextResponse.json(
        {
          message:
            "Attendance has already been marked for one or more dates in this leave period. Leave cannot be requested for those dates.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK OVERLAPPING LEAVE
    // ==========================================

    const existingLeave =
      await prisma.leaveRequest.findFirst({
        where: {
          staffId,

          OR: [
            {
              startDate: {
                lte: end,
              },

              endDate: {
                gte: start,
              },
            },
          ],

          status: {
            in: [
              "PENDING",
              "APPROVED",
            ],
          },
        },
      });

    if (existingLeave) {
      return NextResponse.json(
        {
          message:
            "You already have a leave request for one or more of these dates.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CREATE LEAVE REQUEST
    // ==========================================

    const leaveRequest =
      await prisma.leaveRequest.create({
        data: {
          staffId,

          startDate: start,

          endDate: end,

          reason: reason.trim(),

          status: "PENDING",
        },
      });

    return NextResponse.json(
      {
        message:
          "Leave request submitted successfully",

        leaveRequest,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(
      "SUBMIT LEAVE REQUEST ERROR:",
      error
    );

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


// ==========================================
// PATCH - CANCEL LEAVE REQUEST
// ==========================================

export async function PATCH(request) {
  try {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found in token",
        },
        {
          status: 401,
        }
      );
    }

    const { leaveId } =
      await request.json();

    if (!leaveId) {
      return NextResponse.json(
        {
          message: "Leave ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // FIND LEAVE
    // ==========================================

    const leave =
      await prisma.leaveRequest.findFirst({
        where: {
          id: leaveId,
          staffId,
        },
      });

    if (!leave) {
      return NextResponse.json(
        {
          message:
            "Leave request not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // ONLY PENDING LEAVE CAN BE CANCELLED
    // ==========================================

    if (leave.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "Only pending leave requests can be cancelled",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CANCEL LEAVE
    // ==========================================

    const cancelledLeave =
      await prisma.leaveRequest.update({
        where: {
          id: leaveId,
        },

        data: {
          status: "REJECTED",
        },
      });

    return NextResponse.json(
      {
        message:
          "Leave request cancelled successfully",

        leaveRequest:
          cancelledLeave,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(
      "CANCEL LEAVE ERROR:",
      error
    );

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


// ==========================================
// DELETE - CANCEL LEAVE REQUEST
// ==========================================

export async function DELETE(request) {
  try {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const staffId =
      decoded.userId ||
      decoded.id ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID not found in token",
        },
        {
          status: 401,
        }
      );
    }

    const { leaveId } =
      await request.json();

    if (!leaveId) {
      return NextResponse.json(
        {
          message: "Leave ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // FIND LEAVE
    // ==========================================

    const leave =
      await prisma.leaveRequest.findFirst({
        where: {
          id: leaveId,
          staffId,
        },
      });

    if (!leave) {
      return NextResponse.json(
        {
          message: "Leave request not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // ONLY PENDING LEAVE CAN BE DELETED
    // ==========================================

    if (leave.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "Only pending leave requests can be cancelled",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // DELETE LEAVE REQUEST
    // ==========================================

    await prisma.leaveRequest.delete({
      where: {
        id: leaveId,
      },
    });

    return NextResponse.json(
      {
        message:
          "Leave request cancelled successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(
      "DELETE LEAVE ERROR:",
      error
    );

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