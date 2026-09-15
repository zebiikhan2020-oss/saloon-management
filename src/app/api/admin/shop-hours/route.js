
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function GET() {
  try {
    let businessHours = await prisma.businessHour.findMany();

    // Initialize 7 days if no records exist
    if (businessHours.length === 0) {
      await prisma.businessHour.createMany({
        data: DAYS.map((day) => ({
          day,
          type: "NORMAL",
          openTime: "09:00",
          closeTime: "22:00",
        })),
      });

      businessHours = await prisma.businessHour.findMany();
    }

    // Keep Monday -> Sunday order
    businessHours.sort(
      (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
    );

    return NextResponse.json(businessHours, { status: 200 });
  } catch (error) {
    console.log("GET SHOP HOURS ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      id,
      type,
      openTime,
      closeTime,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["NORMAL", "FULL_DAY", "CLOSED"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid business hour type" },
        { status: 400 }
      );
    }

    const data = {
      type,
      openTime: openTime || "09:00",
      closeTime: closeTime || "22:00",
    };

    const businessHour = await prisma.businessHour.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      {
        message: "Business hours updated successfully",
        businessHour,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("UPDATE SHOP HOURS ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

