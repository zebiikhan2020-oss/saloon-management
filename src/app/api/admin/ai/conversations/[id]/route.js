import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(request, { params }) {
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

    // Verify conversation belongs to logged-in admin.
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

    // Related messages are deleted through Prisma cascade.
    await prisma.aIConversation.delete({
      where: {
        id: conversation.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CONVERSATION ERROR:", error);

    return NextResponse.json(
      { message: "Unable to delete conversation." },
      { status: 500 }
    );
  }
}