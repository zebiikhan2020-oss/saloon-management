import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout successful"
    });

    response.cookies.set(
      "token",
      "",
      {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      }
    );

    return response;

  } catch(error) {
    console.log("LOGOUT ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}