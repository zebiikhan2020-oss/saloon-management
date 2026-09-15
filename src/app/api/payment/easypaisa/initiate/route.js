import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { easypaisaService } from "@/lib/easypaisa";

// Initiate Easypaisa Payment
export async function POST(request) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      decoded.id ||
      decoded.userId ||
      decoded.customerId;

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Customer id not found in token",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // CHECK CUSTOMER
    // =====================================================

    const customerUser = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        role: true,
        isBlocked: true,
        isEmailVerified: true,
        email: true,
      },
    });

    if (!customerUser) {
      return NextResponse.json(
        {
          message: "Customer account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (customerUser.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          message: "Only customers can initiate payments.",
        },
        {
          status: 403,
        }
      );
    }

    if (!customerUser.isEmailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email first.",
        },
        {
          status: 403,
        }
      );
    }

    if (customerUser.isBlocked) {
      return NextResponse.json(
        {
          message: "Your account has been blocked by admin.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // REQUEST DATA
    // =====================================================

    const {
      serviceId,
      staffId,
      date,
      time,
      paymentMethod,
      transactionType, // 'OTC' or 'MA'
      msisdn,
      emailAddress,
    } = await request.json();

    if (!serviceId || !date || !time || !transactionType || !msisdn) {
      return NextResponse.json(
        {
          message: "Service ID, date, time, transaction type, and phone number are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!['OTC', 'MA'].includes(transactionType)) {
      return NextResponse.json(
        {
          message: "Invalid transaction type. Must be 'OTC' or 'MA'.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate phone number
    if (!easypaisaService.validatePhoneNumber(msisdn)) {
      return NextResponse.json(
        {
          message: "Invalid phone number format. Please use format: 03xxxxxxxxx",
        },
        {
          status: 400,
        }
      );
    }

    // Use customer email if not provided
    const email = emailAddress || customerUser.email;

    // Validate email
    if (!easypaisaService.validateEmail(email)) {
      return NextResponse.json(
        {
          message: "Invalid email format.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDATE SERVICE
    // =====================================================

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          message: "Service not found.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // VALIDATE STAFF (if provided)
    // =====================================================

    if (staffId) {
      const staff = await prisma.user.findFirst({
        where: {
          id: staffId,
          role: "STAFF",
          isApproved: true,
          isEmailVerified: true,
        },
      });

      if (!staff) {
        return NextResponse.json(
          {
            message: "Selected staff member is not available.",
          },
          {
          status: 404,
          }
        );
      }

      if (staff.isBlocked) {
        return NextResponse.json(
          {
            message: "Selected staff member is currently unavailable.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // VALIDATE BOOKING DATE AND TIME
    // =====================================================

    const bookingDate = new Date(`${date}T00:00:00`);

    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid appointment date.",
        },
        {
          status: 400,
        }
      );
    }

    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (bookingDate < todayDate) {
      return NextResponse.json(
        {
          message: "Past date not allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // INITIATE EASYPAISA TRANSACTION
    // =====================================================

    const orderId = `BOOKING_${customerId}_${serviceId}_${Date.now()}`;
    const amount = service.price;
    const tokenExpiry = easypaisaService.generateTokenExpiry(24); // 24 hours expiry

    let paymentResponse;

    if (transactionType === 'OTC') {
      paymentResponse = await easypaisaService.initiateOTCTransaction({
        orderId,
        amount,
        msisdn,
        emailAddress: email,
        tokenExpiry,
        optional1: JSON.stringify({
          customerId,
          serviceId,
          staffId: staffId || null,
          date: bookingDate.toISOString(),
          time,
          paymentMethod,
        }),
        optional2: service.name,
        optional3: amount.toString(),
      });
    } else {
      paymentResponse = await easypaisaService.initiateMATransaction({
        orderId,
        amount,
        msisdn,
        emailAddress: email,
        tokenExpiry,
        optional1: JSON.stringify({
          customerId,
          serviceId,
          staffId: staffId || null,
          date: bookingDate.toISOString(),
          time,
          paymentMethod,
        }),
        optional2: service.name,
        optional3: amount.toString(),
      });
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        message: "Payment initiated successfully",
        data: {
          orderId: orderId,
          transactionId: paymentResponse.transactionId,
          token: paymentResponse.token,
          amount: amount,
          transactionType: transactionType,
          tokenExpiry: tokenExpiry,
          status: paymentResponse.status,
          paymentInstructions: transactionType === 'OTC' 
            ? `Please visit any Easypaisa shop and pay using token: ${paymentResponse.token}`
            : 'Please complete the payment from your Easypaisa mobile account',
          note: "Your appointment will be created automatically after successful payment verification.",
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("EASYPAISA PAYMENT INITIATION ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to initiate payment",
      },
      {
        status: 500,
      }
    );
  }
}
