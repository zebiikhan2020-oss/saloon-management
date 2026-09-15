import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token." },
        { status: 401 }
      );
    }

    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
        isBlocked: false,
        isApproved: true,
        isEmailVerified: true,
        staffProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,

        staffProfile: {
          select: {
            profilePicture: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            profession: true,
            expertise: true,
            bio: true,
            yearsOfExperience: true,
            specializedServices: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        staff,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CUSTOMER STAFF PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Failed to fetch staff profiles.",
      },
      { status: 500 }
    );
  }
}