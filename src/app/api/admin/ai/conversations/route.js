
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);

  if (!decoded || decoded.role !== "ADMIN") {
    return null;
  }

  return decoded;
}

// GET ALL CONVERSATIONS
export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId: admin.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("AI CONVERSATIONS GET ERROR:", error);

    return NextResponse.json(
      { message: "Unable to load conversations." },
      { status: 500 }
    );
  }
}

// CREATE NEW CONVERSATION
export async function POST() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: admin.id,
        title: "New Chat",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { conversation },
      { status: 201 }
    );
  } catch (error) {
    console.error("AI CONVERSATION CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Unable to create conversation." },
      { status: 500 }
    );
  }
}
