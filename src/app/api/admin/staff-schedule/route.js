import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    const where = {};
    
    if (staffId) {
      where.staffId = staffId;
    }

    const schedules = await prisma.staffSchedule.findMany({
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
        day: "asc",
      },
    });

    return NextResponse.json(schedules);

  } catch (error) {
    console.log("GET STAFF SCHEDULE ERROR:", error);

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

export async function POST(request) {
  try {
    const { staffId, day, status } = await request.json();

    if (!staffId || !day || !status) {
      return NextResponse.json(
        {
          message: "staffId, day, and status are required",
        },
        {
          status: 400,
        }
      );
    }

    if (!["WORKING", "OFF"].includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid status. Must be WORKING or OFF",
        },
        {
          status: 400,
        }
      );
    }

    const schedule = await prisma.staffSchedule.create({
      data: {
        staffId,
        day,
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

    return NextResponse.json({
      message: "Staff schedule created successfully",
      schedule,
    });

  } catch (error) {
    console.log("CREATE STAFF SCHEDULE ERROR:", error);

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

export async function PUT(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          message: "id and status are required",
        },
        {
          status: 400,
        }
      );
    }

    if (!["WORKING", "OFF"].includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid status. Must be WORKING or OFF",
        },
        {
          status: 400,
        }
      );
    }

    const schedule = await prisma.staffSchedule.update({
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

    return NextResponse.json({
      message: "Staff schedule updated successfully",
      schedule,
    });

  } catch (error) {
    console.log("UPDATE STAFF SCHEDULE ERROR:", error);

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "id is required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.staffSchedule.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Staff schedule deleted successfully",
    });

  } catch (error) {
    console.log("DELETE STAFF SCHEDULE ERROR:", error);

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
