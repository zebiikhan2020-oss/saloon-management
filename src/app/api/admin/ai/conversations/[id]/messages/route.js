import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

// ========================================
// GET CONVERSATION MESSAGES
// ========================================

export async function GET(request, { params }) {
  try {
    // Admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify conversation ownership
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id,
        userId: decoded.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found." },
        { status: 404 }
      );
    }

    // Load messages
    const messages = await prisma.aIMessage.findMany({
      where: {
        conversationId: id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("AI MESSAGES GET ERROR:", error);

    return NextResponse.json(
      { message: "Unable to load chat messages." },
      { status: 500 }
    );
  }
}