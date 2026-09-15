import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        services: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    if (category.services.length > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete this category because services are linked to it.",
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}