import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function getCustomerFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    if (!payload.id || payload.role !== "CUSTOMER") return null;

    return payload;
  } catch (error) {
    console.error("CUSTOMER TOKEN ERROR:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    const where = {};
    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const reviews = await prisma.appointmentReview.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET APPOINTMENT REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointment reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { appointmentId, rating, comment } = await request.json();

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { success: false, message: "Appointment ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if appointment exists and belongs to customer
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify customer owns this appointment
    if (appointment.customerId !== customer.id) {
      return NextResponse.json(
        { success: false, message: "You can only review your own appointments" },
        { status: 403 }
      );
    }

    // Check if appointment is COMPLETED
    if (appointment.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "You can only review completed appointments" },
        { status: 400 }
      );
    }

    // Check if appointment already has a review
    const existingReview = await prisma.appointmentReview.findUnique({
      where: { appointmentId },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "This appointment already has a review" },
        { status: 400 }
      );
    }

    const review = await prisma.appointmentReview.create({
      data: {
        appointmentId,
        customerId: customer.id,
        rating,
        comment: comment || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          include: {
            service: true,
          },
        },
      },
    });

    // Create notification for staff if appointment has staff
    if (appointment.staffId) {
      await prisma.notification.create({
        data: {
          userId: appointment.staffId,
          title: "New Appointment Review",
          message: `${customer.name || "A customer"} reviewed their appointment for ${appointment.service?.name || "service"} with ${rating}/5 stars.`,
          type: "REVIEW",
          appointmentId: appointment.id,
        },
      });
    }

    // Notify all admins
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
          title: "New Appointment Review",
          message: `${customer.name || "A customer"} reviewed an appointment for ${appointment.service?.name || "service"} with ${rating}/5 stars.`,
          type: "REVIEW",
          appointmentId: appointment.id,
        })),
      });
    }

    return NextResponse.json(
      { success: true, message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST APPOINTMENT REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, rating, comment } = await request.json();

    if (!id || !rating) {
      return NextResponse.json(
        { success: false, message: "ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if review belongs to customer
    const existingReview = await prisma.appointmentReview.findFirst({
      where: {
        id,
        customerId: customer.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    const review = await prisma.appointmentReview.update({
      where: { id },
      data: {
        rating,
        comment: comment || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Review updated successfully", review }
    );
  } catch (error) {
    console.error("PUT APPOINTMENT REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const customer = await getCustomerFromToken(request);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 }
      );
    }

    // Check if review belongs to customer
    const existingReview = await prisma.appointmentReview.findFirst({
      where: {
        id,
        customerId: customer.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await prisma.appointmentReview.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" }
    );
  } catch (error) {
    console.error("DELETE APPOINTMENT REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}
