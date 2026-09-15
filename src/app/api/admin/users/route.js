import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";


// ===============================
// GET ALL CUSTOMERS + STAFF
// ===============================
export async function GET() {
  try {
    // Get token from cookie
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

    // Verify JWT
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }

    // Only ADMIN allowed
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Access denied. Admin only.",
        },
        {
          status: 403,
        }
      );
    }

    // Get customers + staff
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["CUSTOMER", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isApproved: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        users,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch users",
      },
      {
        status: 500,
      }
    );
  }
}


// ===============================
// BLOCK / UNBLOCK USER
// ===============================
export async function PATCH(request) {
  try {
    // Get token
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

    // Verify token
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }

    // Admin only
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Access denied. Admin only.",
        },
        {
          status: 403,
        }
      );
    }

    // Request body
    const { userId, isBlocked } = await request.json();

    if (!userId || typeof isBlocked !== "boolean") {
      return NextResponse.json(
        {
          message: "userId and isBlocked are required",
        },
        {
          status: 400,
        }
      );
    }

    // Find target user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Never allow admin to be blocked/unblocked through this API
    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          message: "Admin accounts cannot be blocked here",
        },
        {
          status: 403,
        }
      );
    }

    // Only Customer + Staff
    if (
      user.role !== "CUSTOMER" &&
      user.role !== "STAFF"
    ) {
      return NextResponse.json(
        {
          message: "Invalid user role",
        },
        {
          status: 400,
        }
      );
    }

    // Update block status
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isBlocked,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
      },
    });

    return NextResponse.json(
      {
        message: isBlocked
          ? "User blocked successfully"
          : "User unblocked successfully",
        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update user status",
      },
      {
        status: 500,
      }
    );
  }
}