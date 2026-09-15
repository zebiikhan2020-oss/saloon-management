import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { easypaisaService } from "@/lib/easypaisa";

// Easypaisa Payment Callback/Webhook
// This endpoint receives payment status updates from Easypaisa
export async function POST(request) {
  try {
    // =====================================================
    // PARSE CALLBACK DATA
    // =====================================================

    const callbackData = await request.json();

    console.log("EASYPAISA CALLBACK RECEIVED:", callbackData);

    // Extract relevant fields from Easypaisa callback
    // The exact field names depend on Easypaisa's callback structure
    const {
      transactionId,
      orderId,
      status,
      amount,
      responseCode,
      responseMessage,
      optional1, // booking data JSON
      optional2, // service name
      optional3, // amount
    } = callbackData;

    if (!transactionId || !orderId) {
      console.error("Invalid callback: Missing transactionId or orderId");
      return NextResponse.json(
        {
          message: "Invalid callback data",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VERIFY TRANSACTION WITH EASYPAISA
    // =====================================================
    
    // Always verify the transaction status with Easypaisa API
    // to ensure the callback is legitimate
    const verification = await easypaisaService.inquireTransactionStatus(transactionId);

    if (!verification.success) {
      console.error("Transaction verification failed:", verification);
      return NextResponse.json(
        {
          message: "Transaction verification failed",
        },
        {
          status: 400,
        }
      );
    }

    const paymentStatus = verification.status;

    // =====================================================
    // EXTRACT BOOKING DATA FROM OPTIONAL FIELD
    // =====================================================

    let bookingData;

    try {
      bookingData = JSON.parse(optional1);
    } catch (error) {
      console.error("Failed to parse booking data from optional1:", error);
      return NextResponse.json(
        {
          message: "Invalid booking data format",
        },
        {
          status: 400,
        }
      );
    }

    const {
      customerId,
      serviceId,
      staffId,
      date,
      time,
      paymentMethod,
    } = bookingData;

    if (!customerId || !serviceId || !date || !time) {
      console.error("Missing required booking data");
      return NextResponse.json(
        {
          message: "Incomplete booking data",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CHECK IF APPOINTMENT ALREADY EXISTS
    // =====================================================

    // Check if appointment was already created for this transaction
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        customerId,
        serviceId,
        date: new Date(date),
        time,
        paymentMethod: "EASYPAISA",
      },
    });

    if (existingAppointment && existingAppointment.paymentStatus === "PAID") {
      console.log("Appointment already created and paid for this transaction");
      return NextResponse.json(
        {
          message: "Appointment already processed",
          data: {
            appointmentId: existingAppointment.id,
            transactionId,
            paymentStatus,
          },
        },
        {
          status: 200,
        }
      );
    }

    // =====================================================
    // CREATE APPOINTMENT AFTER SUCCESSFUL PAYMENT
    // =====================================================

    if (paymentStatus === "PAID") {
      // Calculate end time
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        console.error("Service not found for booking");
        return NextResponse.json(
          {
            message: "Service not found",
          },
          {
            status: 404,
          }
        );
      }

      const [startHour, startMinute] = time.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = startTotalMinutes + service.duration;
      const endHour = Math.floor(endTotalMinutes / 60);
      const endMinute = endTotalMinutes % 60;
      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      // Create the appointment with PAID status
      const appointment = await prisma.appointment.create({
        data: {
          customerId,
          serviceId,
          staffId: staffId || null,
          date: new Date(date),
          time,
          endTime,
          paymentMethod: "EASYPAISA",
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      // =====================================================
      // CREATE NOTIFICATION FOR CUSTOMER
      // =====================================================

      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: customerId,
          title: "Payment Successful - Appointment Confirmed",
          message: `Your payment has been confirmed. Your appointment for ${service.name} on ${new Date(date).toDateString()} at ${time} has been booked successfully.`,
          type: "PAYMENT",
          appointmentId: appointment.id,
        },
      });

      // =====================================================
      // CREATE NOTIFICATIONS FOR ADMINS
      // =====================================================

      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },
        select: {
          id: true,
        },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "New Paid Appointment",
            message: `${customer?.name || "A customer"} booked and paid for ${service.name} on ${new Date(date).toDateString()} at ${time}.`,
            type: "APPOINTMENT",
            appointmentId: appointment.id,
          })),
        });
      }

      // =====================================================
      // CREATE NOTIFICATION FOR STAFF (IF ASSIGNED)
      // =====================================================

      if (staffId) {
        await prisma.notification.create({
          data: {
            userId: staffId,
            title: "New Appointment Assigned",
            message: `You have a new paid appointment for ${service.name} on ${new Date(date).toDateString()} at ${time}.`,
            type: "APPOINTMENT",
            appointmentId: appointment.id,
          },
        });
      }

      return NextResponse.json(
        {
          message: "Payment verified and appointment created successfully",
          data: {
            appointmentId: appointment.id,
            transactionId,
            paymentStatus,
          },
        },
        {
          status: 201,
        }
      );
    } else if (paymentStatus === "FAILED") {
      // Payment failed - notify customer but don't create appointment
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        select: { name: true, email: true },
      });

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: customerId,
          title: "Payment Failed",
          message: `Your payment for ${service?.name || "service"} on ${new Date(date).toDateString()} at ${time} has failed. Please try booking again.`,
          type: "PAYMENT",
        },
      });

      return NextResponse.json(
        {
          message: "Payment failed - appointment not created",
          data: {
            transactionId,
            paymentStatus,
          },
        },
        {
          status: 200,
        }
      );
    }

    // Payment still pending
    return NextResponse.json(
      {
        message: "Payment pending - waiting for confirmation",
        data: {
          transactionId,
          paymentStatus,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("EASYPAISA CALLBACK ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to process callback",
      },
      {
        status: 500,
      }
    );
  }
}
