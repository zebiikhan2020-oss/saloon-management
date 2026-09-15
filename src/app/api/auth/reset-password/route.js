import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    // ==============================
    // VALIDATION
    // ==============================

    if (!token || !password) {
      return NextResponse.json(
        {
          message: "Token and new password are required",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // PASSWORD VALIDATION
    // ==============================

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters long",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // FIND USER BY RESET TOKEN
    // ==============================

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,

        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    // ==============================
    // INVALID / EXPIRED TOKEN
    // ==============================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired reset token",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // HASH NEW PASSWORD
    // ==============================

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // ==============================
    // UPDATE PASSWORD
    // ==============================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        // Token ko one-time use bana dein
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // ==============================
    // SUCCESS
    // ==============================

    return NextResponse.json(
      {
        message:
          "Password reset successful. You can now login.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(
      "RESET PASSWORD ERROR:",
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