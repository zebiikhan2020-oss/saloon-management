import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// =====================================================
// GET STAFF PROFILE - ADMIN ONLY
// =====================================================

export async function GET(request) {
  try {
    // =====================================================
    // GET TOKEN
    // =====================================================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // ADMIN ONLY
    // =====================================================

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Access denied. Admin only.",
        },
        { status: 403 }
      );
    }

    // =====================================================
    // GET STAFF ID
    // =====================================================

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json(
        {
          message: "Staff ID is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // GET STAFF + PROFILE
    // =====================================================

    const staff = await prisma.user.findUnique({
      where: {
        id: staffId,
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

        staffProfile: {
          select: {
            id: true,
            profilePicture: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            profession: true,
            expertise: true,
            bio: true,
            yearsOfExperience: true,
            specializedServices: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // =====================================================
    // STAFF NOT FOUND
    // =====================================================

    if (!staff) {
      return NextResponse.json(
        {
          message: "Staff not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // MAKE SURE USER IS STAFF
    // =====================================================

    if (staff.role !== "STAFF") {
      return NextResponse.json(
        {
          message: "Selected user is not a staff member.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // RETURN STAFF PROFILE
    // =====================================================

    return NextResponse.json(
      {
        staff,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ADMIN STAFF PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Failed to fetch staff profile.",
      },
      { status: 500 }
    );
  }
}