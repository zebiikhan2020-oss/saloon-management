import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =====================================================
// GET STAFF PROFILE
// =====================================================

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

    const staffId =
      decoded.id ||
      decoded.userId ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        { message: "Staff id not found in token." },
        { status: 401 }
      );
    }

    // Make sure logged-in user is STAFF
    const staff = await prisma.user.findUnique({
      where: {
        id: staffId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        isApproved: true,
        isEmailVerified: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { message: "Staff account not found." },
        { status: 404 }
      );
    }

    if (staff.role !== "STAFF") {
      return NextResponse.json(
        { message: "Only staff can access this profile." },
        { status: 403 }
      );
    }

    if (staff.isBlocked) {
      return NextResponse.json(
        { message: "Your account has been blocked by admin." },
        { status: 403 }
      );
    }

    // Get staff professional profile
    const profile = await prisma.staffProfile.findUnique({
      where: {
        staffId,
      },
    });

    return NextResponse.json({
      staff,
      profile,
    });
  } catch (error) {
    console.log("GET STAFF PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Failed to fetch staff profile.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CREATE / UPDATE STAFF PROFILE
// =====================================================

export async function PUT(request) {
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

    const staffId =
      decoded.id ||
      decoded.userId ||
      decoded.staffId;

    if (!staffId) {
      return NextResponse.json(
        { message: "Staff id not found in token." },
        { status: 401 }
      );
    }

    // Make sure logged-in user is STAFF
    const staff = await prisma.user.findUnique({
      where: {
        id: staffId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        isApproved: true,
        isEmailVerified: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { message: "Staff account not found." },
        { status: 404 }
      );
    }

    if (staff.role !== "STAFF") {
      return NextResponse.json(
        { message: "Only staff can update this profile." },
        { status: 403 }
      );
    }

    if (staff.isBlocked) {
      return NextResponse.json(
        { message: "Your account has been blocked by admin." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      profilePicture,
      fullName,
      phoneNumber,
      email,
      profession,
      expertise,
      bio,
      yearsOfExperience,
      specializedServices,
    } = body;

    // Required fields
    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !profession
    ) {
      return NextResponse.json(
        {
          message:
            "Full name, phone number, email and profession are required.",
        },
        { status: 400 }
      );
    }

    // Arrays
    const expertiseArray = Array.isArray(expertise)
      ? expertise
      : [];

    const specializedServicesArray =
      Array.isArray(specializedServices)
        ? specializedServices
        : [];

    // Experience
    let experience = null;

    if (
      yearsOfExperience !== null &&
      yearsOfExperience !== undefined &&
      yearsOfExperience !== ""
    ) {
      experience = Number(yearsOfExperience);

      if (
        Number.isNaN(experience) ||
        experience < 0
      ) {
        return NextResponse.json(
          {
            message:
              "Years of experience must be a valid positive number.",
          },
          { status: 400 }
        );
      }
    }

    // Create or update profile
    const profile = await prisma.staffProfile.upsert({
      where: {
        staffId,
      },

      create: {
        staffId,
        profilePicture: profilePicture || null,
        fullName,
        phoneNumber,
        email,
        profession,
        expertise: expertiseArray,
        bio: bio || null,
        yearsOfExperience: experience,
        specializedServices:
          specializedServicesArray,
      },

      update: {
        profilePicture: profilePicture || null,
        fullName,
        phoneNumber,
        email,
        profession,
        expertise: expertiseArray,
        bio: bio || null,
        yearsOfExperience: experience,
        specializedServices:
          specializedServicesArray,
      },
    });

    return NextResponse.json(
      {
        message: "Staff profile saved successfully.",
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("SAVE STAFF PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message:
          error.message || "Failed to save staff profile.",
      },
      { status: 500 }
    );
  }
}