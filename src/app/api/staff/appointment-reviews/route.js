import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "STAFF") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    const where = {
      appointment: {
        staffId: decoded.id,
      },
    };

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const { prisma } = await import("@/lib/prisma");

    const reviews = await prisma.appointmentReview.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET STAFF APPOINTMENT REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointment reviews" },
      { status: 500 }
    );
  }
}
