import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  console.log("MIDDLEWARE RUNNING FOR:", request.nextUrl.pathname);

  const token = request.cookies.get("token")?.value;

  if (!token) {
    console.log("NO TOKEN FOUND, REDIRECTING TO LOGIN");

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    await jwtVerify(token, secret);

    console.log("TOKEN VALID");

    return NextResponse.next();

  } catch (error) {
    console.log("INVALID TOKEN, REDIRECTING TO LOGIN");

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/customer/:path*",
  ],
};