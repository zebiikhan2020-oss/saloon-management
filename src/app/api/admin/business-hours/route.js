import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// =====================================================
// GET - Weekly + Special Business Hours
// =====================================================

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const businessHours = await prisma.businessHour.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const specialBusinessHours =
      await prisma.specialBusinessHour.findMany({
        orderBy: {
          date: "asc",
        },
      });

    return NextResponse.json(
      {
        businessHours,
        specialBusinessHours,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET BUSINESS HOURS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch business hours" },
      { status: 500 }
    );
  }
}


// =====================================================
// POST - Create / Update Weekly Business Hour
// =====================================================

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      day,
      type,
      openTime,
      closeTime,
    } = body;

    if (!day || !type) {
      return NextResponse.json(
        {
          message: "Day and type are required",
        },
        { status: 400 }
      );
    }

    if (!["NORMAL", "FULL_DAY", "CLOSED"].includes(type)) {
      return NextResponse.json(
        {
          message: "Invalid business hour type",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // CLOSED
    // -------------------------------------------------

    if (type === "CLOSED") {
      const businessHour =
        await prisma.businessHour.upsert({
          where: {
            day,
          },

          update: {
            type: "CLOSED",
          },

          create: {
            day,
            type: "CLOSED",
            openTime: "09:00",
            closeTime: "22:00",
          },
        });

      return NextResponse.json(
        {
          message: `${day} marked as closed`,
          businessHour,
        },
        { status: 200 }
      );
    }

    // -------------------------------------------------
    // FULL DAY
    // -------------------------------------------------

    if (type === "FULL_DAY") {
      const businessHour =
        await prisma.businessHour.upsert({
          where: {
            day,
          },

          update: {
            type: "FULL_DAY",
          },

          create: {
            day,
            type: "FULL_DAY",
            openTime: "00:00",
            closeTime: "23:59",
          },
        });

      return NextResponse.json(
        {
          message: `${day} set as full day`,
          businessHour,
        },
        { status: 200 }
      );
    }

    // -------------------------------------------------
    // NORMAL
    // -------------------------------------------------

    if (!openTime || !closeTime) {
      return NextResponse.json(
        {
          message:
            "Open time and close time are required for normal hours",
        },
        { status: 400 }
      );
    }

    const businessHour =
      await prisma.businessHour.upsert({
        where: {
          day,
        },

        update: {
          type: "NORMAL",
          openTime,
          closeTime,
        },

        create: {
          day,
          type: "NORMAL",
          openTime,
          closeTime,
        },
      });

    return NextResponse.json(
      {
        message: `${day} business hours updated`,
        businessHour,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST BUSINESS HOURS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to save business hours",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// PATCH - Create / Update Special Business Hour
// =====================================================

export async function PATCH(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      date,
      type,
      openTime,
      closeTime,
      reason,
    } = body;

    if (!date || !type) {
      return NextResponse.json(
        {
          message: "Date and type are required",
        },
        { status: 400 }
      );
    }

    if (!["NORMAL", "FULL_DAY", "CLOSED"].includes(type)) {
      return NextResponse.json(
        {
          message: "Invalid special business hour type",
        },
        { status: 400 }
      );
    }

    let finalOpenTime = openTime || null;
    let finalCloseTime = closeTime || null;

    if (type === "FULL_DAY") {
      finalOpenTime = "00:00";
      finalCloseTime = "23:59";
    }

    if (type === "CLOSED") {
      finalOpenTime = null;
      finalCloseTime = null;
    }

    const specialBusinessHour =
      await prisma.specialBusinessHour.upsert({
        where: {
          date: new Date(date),
        },

        update: {
          type,
          openTime: finalOpenTime,
          closeTime: finalCloseTime,
          reason: reason || null,
        },

        create: {
          date: new Date(date),
          type,
          openTime: finalOpenTime,
          closeTime: finalCloseTime,
          reason: reason || null,
        },
      });

    return NextResponse.json(
      {
        message: "Special business hour saved",
        specialBusinessHour,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PATCH SPECIAL BUSINESS HOURS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to save special business hour",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// DELETE - Delete Special Business Hour
// =====================================================

export async function DELETE(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Special business hour ID is required",
        },
        { status: 400 }
      );
    }

    await prisma.specialBusinessHour.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        message: "Special business hour deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE SPECIAL BUSINESS HOURS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to delete special business hour",
      },
      { status: 500 }
    );
  }
}