import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================================
// UPDATE SERVICE
// ==========================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Service ID is required" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      duration,
      price,
      categoryId,
    } = await request.json();

    if (
      !name ||
      !duration ||
      price === undefined ||
      price === null ||
      !categoryId
    ) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const existingService = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.service.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        duration: parseInt(duration),
        price: parseFloat(price),
        categoryId,
      },
    });

    return NextResponse.json(updatedService, {
      status: 200,
    });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE SERVICE
// ==========================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Service ID is required" },
        { status: 400 }
      );
    }

    const existingService = await prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        appointments: true,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Old appointments ko safe rakhna hai
    if (existingService.appointments.length > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete this service because it is linked to appointments.",
        },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}

