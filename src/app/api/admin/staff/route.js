import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================
// GET ALL STAFF
// ==========================
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        isApproved: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.log("GET STAFF ERROR:", error);

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

// ==========================
// APPROVE STAFF
// ==========================
export async function PUT(request) {
  try {
    const { id } = await request.json();

    // ==========================
    // VALIDATE STAFF ID
    // ==========================

    if (!id) {
      return NextResponse.json(
        {
          message: "Staff ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // FIND STAFF
    // ==========================

    const existingStaff = await prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        isApproved: true,
        role: true,
      },
    });

    // ==========================
    // STAFF NOT FOUND
    // ==========================

    if (!existingStaff) {
      return NextResponse.json(
        {
          message: "Staff not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================
    // CHECK ROLE
    // ==========================

    if (existingStaff.role !== "STAFF") {
      return NextResponse.json(
        {
          message: "User is not staff",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // CHECK EMAIL VERIFICATION
    // ==========================

    if (!existingStaff.isEmailVerified) {
      return NextResponse.json(
        {
          message: "Staff email is not verified yet",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // ALREADY APPROVED
    // ==========================

    if (existingStaff.isApproved) {
      return NextResponse.json(
        {
          message: "Staff is already approved",
          staff: existingStaff,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // APPROVE STAFF
    // ==========================

    const staff = await prisma.user.update({
      where: {
        id,
      },

      data: {
        isApproved: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isApproved: true,
      },
    });

    // ==========================
    // CREATE STAFF NOTIFICATION
    // ==========================

    await prisma.notification.create({
      data: {
        userId: staff.id,

        title: "Account Approved",

        message:
          "Your staff account has been approved by the admin. You can now use your staff dashboard.",

        type: "STAFF_APPROVAL",
      },
    });

    // ==========================
    // SUCCESS
    // ==========================

    return NextResponse.json(
      {
        message: "Staff approved successfully",
        staff,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("APPROVE STAFF ERROR:", error);

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