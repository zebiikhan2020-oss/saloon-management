import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // ==========================================
    // 1. GET DATA
    // ==========================================

    const {
      email,
      oldPassword,
      newPassword,
      confirmPassword,
    } = await request.json();

    // ==========================================
    // 2. REQUIRED FIELDS
    // ==========================================

    if (
      !email ||
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message:
            "Email, old password, new password and confirm password are required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 3. FIND ACCOUNT BY EMAIL
    // ==========================================

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    // ==========================================
    // 4. ACCOUNT NOT FOUND
    // ==========================================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "No account found with this email address.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // 5. NEW PASSWORD LENGTH
    // ==========================================

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          message:
            "New password must be at least 6 characters long",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 6. CONFIRM PASSWORD
    // ==========================================

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message:
            "New password and confirm password do not match",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 7. OLD & NEW PASSWORD SAME
    // ==========================================

    if (oldPassword === newPassword) {
      return NextResponse.json(
        {
          message:
            "New password must be different from old password",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 8. CHECK OLD PASSWORD
    // ==========================================

    const isPasswordMatch =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          message:
            "Incorrect old password.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 9. HASH NEW PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ==========================================
    // 10. UPDATE PASSWORD
    // ==========================================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,
      },
    });

    // ==========================================
    // 11. SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        message:
          "Password changed successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.log(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}