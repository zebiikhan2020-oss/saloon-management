import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { easypaisaService } from "@/lib/easypaisa";

// Verify Easypaisa Payment Status
// This endpoint can be called to manually check payment status
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
    // REQUEST DATA
    // =====================================================

    const {
      appointmentId,
      transactionId,
    } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        {
          message: "Appointment ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CHECK APPOINTMENT
    // =====================================================

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          message: "Appointment not found",
        },
        {
          status: 404,
        }
      );
    }

    // Verify appointment belongs to customer
    if (appointment.customerId !== customerId) {
      return NextResponse.json(
        {
          message: "You can only verify payment for your own appointments",
        },
        {
          status: 403,
        }
      );
    }

    // If already paid, return current status
    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          message: "Payment already confirmed",
          data: {
            appointmentId: appointment.id,
            paymentStatus: appointment.paymentStatus,
            appointmentStatus: appointment.status,
          },
        },
        {
          status: 200,
        }
      );
    }

    // =====================================================
    // VERIFY WITH EASYPAISA IF TRANSACTION ID PROVIDED
    // =====================================================

    if (transactionId) {
      try {
        const verification = await easypaisaService.inquireTransactionStatus(transactionId);

        if (verification.success) {
          const paymentStatus = verification.status;

          // Update appointment if payment is successful
          if (paymentStatus === "PAID") {
            await prisma.appointment.update({
              where: {
                id: appointmentId,
              },
              data: {
                paymentStatus: "PAID",
                status: "CONFIRMED",
              },
            });

            // Create notification for customer
            await prisma.notification.create({
              data: {
                userId: appointment.customerId,
                title: "Payment Successful",
                message: `Your payment for appointment on ${appointment.date.toDateString()} at ${appointment.time} has been confirmed.`,
                type: "PAYMENT",
                appointmentId: appointmentId,
              },
            });

            // Notify admins
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
                  title: "Payment Received",
                  message: `Payment received for appointment ${appointmentId}. Status: PAID`,
                  type: "PAYMENT",
                  appointmentId: appointmentId,
                })),
              });
            }

            // Notify staff if assigned
            if (appointment.staffId) {
              await prisma.notification.create({
                data: {
                  userId: appointment.staffId,
                  title: "Appointment Payment Confirmed",
                  message: `Payment confirmed for appointment on ${appointment.date.toDateString()} at ${appointment.time}.`,
                  type: "PAYMENT",
                  appointmentId: appointmentId,
                },
              });
            }
          } else if (paymentStatus === "FAILED") {
            await prisma.appointment.update({
              where: {
                id: appointmentId,
              },
              data: {
                paymentStatus: "FAILED",
              },
            });
          }

          return NextResponse.json(
            {
              message: "Payment status verified",
              data: {
                appointmentId: appointment.id,
                transactionId: transactionId,
                paymentStatus: paymentStatus,
                appointmentStatus: appointment.status,
                verificationData: verification.data,
              },
            },
            {
              status: 200,
            }
          );
        }
      } catch (error) {
        console.error("Easypaisa verification error:", error);
        // Continue to return current appointment status if verification fails
      }
    }

    // =====================================================
    // RETURN CURRENT APPOINTMENT STATUS
    // =====================================================

    return NextResponse.json(
      {
        message: "Current payment status",
        data: {
          appointmentId: appointment.id,
          paymentStatus: appointment.paymentStatus,
          appointmentStatus: appointment.status,
          paymentMethod: appointment.paymentMethod,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("PAYMENT VERIFICATION ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to verify payment",
      },
      {
        status: 500,
      }
    );
  }
}
