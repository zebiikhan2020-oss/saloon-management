import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =====================================================
// GET STAFF APPOINTMENT HISTORY
// COMPLETED + REJECTED APPOINTMENTS
// =====================================================

export async function GET() {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

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

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // STAFF ONLY
    // =====================================================

    if (decoded.role !== "STAFF") {
      return NextResponse.json(
        {
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // GET STAFF HISTORY
    // =====================================================

    const appointments = await prisma.appointment.findMany({
      where: {
        staffId: decoded.id,

        status: {
          in: ["COMPLETED", "REJECTED"],
        },
      },

      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: [
        {
          date: "desc",
        },
        {
          time: "desc",
        },
      ],
    });

    return NextResponse.json(
      appointments,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET STAFF APPOINTMENT HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}