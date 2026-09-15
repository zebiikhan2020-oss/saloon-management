import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";


export async function POST(request) {

  console.log("SIGNUP API HIT");
  try {
    const body = await request.json();

    const { name, email, password, role } = body; // <-- Yahan 'role' add kar lia

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        { status: 400 }
      );
    }


    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already registered",
        },
        { status: 400 }
      );
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);


    // Create verification token
    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");


    const verificationTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );


    // Determine role and approval status
    // Agar role "STAFF" hai toh role STAFF rahega aur isApproved false hoga, warna CUSTOMER aur true
    const userRole = role === "STAFF" ? "STAFF" : "CUSTOMER";
    const isApprovedStatus = userRole === "STAFF" ? false : true;


    // Create account (Customer or Staff)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        role: userRole,

        isEmailVerified: false,
        isApproved: isApprovedStatus, // <-- Yahan dynamic approval set ho gaya

        verificationToken,
        verificationTokenExpiry,
      },
    });


    // Verification URL
    const verificationUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;


    // Dynamic email content based on role
    const emailHtml = userRole === "STAFF" 
      ? `
        <h2>Welcome ${name}</h2>
        <p>Your staff account has been created. Please verify your email address.</p>
        <p><strong>Note:</strong> Your account requires Admin approval before you can log in.</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
      : `
        <h2>Welcome ${name}</h2>
        <p>Thank you for creating your account. Please verify your email address.</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `;


    // Send email
    console.log("Before sendEmail");
    await sendEmail({
      to: email,
      subject: userRole === "STAFF" ? "Staff Account - Pending Approval" : "Verify your Salon Management account",
      html: emailHtml,
    });


    // Dynamic response message based on role
    const responseMessage = userRole === "STAFF"
      ? "Staff account created. Please verify your email. Waiting for admin approval."
      : "Account created. Please verify your email.";


    return NextResponse.json(
      {
        message: responseMessage,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.log("SIGNUP ERROR:", error);

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