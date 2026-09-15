import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request) {

  try {

    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token");


    if (!token) {

      return NextResponse.json(
        {
          message: "Verification token missing"
        },
        {
          status: 400
        }
      );

    }


    const user = await prisma.user.findFirst({

      where: {

        verificationToken: token

      }

    });


    if (!user) {

      return NextResponse.json(
        {
          message: "Invalid verification token"
        },
        {
          status: 400
        }
      );

    }



    // Check token expiry

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {

      return NextResponse.json(
        {
          message: "Verification link expired"
        },
        {
          status: 400
        }
      );

    }



    // Verify user

    await prisma.user.update({

      where: {

        id: user.id

      },

      data: {

        isEmailVerified: true,

        verificationToken: null,

        verificationTokenExpiry: null

      }

    });



    return NextResponse.json({

      message:
      "Email verified successfully"

    });



  } catch(error) {


    console.log(
      "VERIFY EMAIL ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:"Server error"
      },
      {
        status:500
      }
    );

  }

}