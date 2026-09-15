import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all services with category details
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch services" }, { status: 500 });
  }
}

// Create service (Admin)
export async function POST(request) {
  try {
    const { name, description, duration, price, categoryId } = await request.json();

    if (!name || !duration || !price || !categoryId) {
      return NextResponse.json({ message: "All required fields must be filled" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        categoryId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("SERVICE ERROR:", error);
    return NextResponse.json({ message: "Failed to create service" }, { status: 500 });
  }
}