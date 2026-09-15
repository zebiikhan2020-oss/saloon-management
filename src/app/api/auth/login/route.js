import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";


export async function POST(request) {

  try {

    const {
      email,
      password
    } = await request.json();


    // Validation
    if (!email || !password) {

      return NextResponse.json(
        {
          message: "Email and password are required"
        },
        {
          status: 400
        }
      );

    }


    // Find user
    const user = await prisma.user.findUnique({

      where: {
        email
      }

    });


    if (!user) {

      return NextResponse.json(
        {
          message: "Invalid email or password"
        },
        {
          status: 401
        }
      );

    }

    if (user.isBlocked) {
  return NextResponse.json(
    {
      message: "Your account has been blocked by admin",
    },
    {
      status: 403,
    }
  );
}



    // Check email verification

    if (!user.isEmailVerified) {

      return NextResponse.json(
        {
          message:
          "Please verify your email first"
        },
        {
          status: 403
        }
      );

    }



    // Staff approval check

    if (
      user.role === "STAFF" &&
      !user.isApproved
    ) {

      return NextResponse.json(
        {
          message:
          "Your account is waiting for admin approval"
        },
        {
          status: 403
        }
      );

    }



    // Compare password
    console.log("LOGIN USER:", user.email);
console.log("Verified:", user.isEmailVerified);
console.log("Approved:", user.isApproved);
console.log("Role:", user.role);

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return NextResponse.json(
        {
          message:
          "Invalid email or password"
        },
        {
          status:401
        }
      );

    }



    // Create JWT

    const token = await createToken({

      id: user.id,

      email: user.email,

      role: user.role

    });



    // Create response

    const response =
      NextResponse.json({

        message:
        "Login successful",

        user:{

          id:user.id,

          name:user.name,

          email:user.email,

          role:user.role

        }

      });



    // Save cookie

    response.cookies.set(
      "token",
      token,
      {

        httpOnly:true,

        secure:
        process.env.NODE_ENV === "production",

        sameSite:"lax",

        maxAge:
        60 * 60 * 24 * 7

      }
    );



    return response;



  } catch(error) {


    console.log(
      "LOGIN ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
        "Server error"
      },
      {
        status:500
      }
    );

  }

}