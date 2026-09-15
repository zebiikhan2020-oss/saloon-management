import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

// =====================================================
// JWT SECRET
// =====================================================

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

// =====================================================
// GET USER FROM TOKEN
// =====================================================

async function getUserFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      secret
    );

    if (!payload.id) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(
      "NOTIFICATION TOKEN ERROR:",
      error
    );

    return null;
  }
}

// =====================================================
// GET NOTIFICATIONS
// =====================================================

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------------
    // GET USER NOTIFICATIONS
    // -----------------------------------------------

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // -----------------------------------------------
    // GET UNREAD COUNT
    // -----------------------------------------------

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      });

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// PATCH NOTIFICATION
// MARK SINGLE / ALL AS READ
// =====================================================

export async function PATCH(request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const { id, markAll } = body;

    // =================================================
    // MARK ALL AS READ
    // =================================================

    if (markAll === true) {
      const result =
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            isRead: false,
          },

          data: {
            isRead: true,
          },
        });

      return NextResponse.json(
        {
          success: true,
          message:
            "All notifications marked as read",
          updatedCount: result.count,
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // SINGLE NOTIFICATION ID REQUIRED
    // =================================================

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // FIND NOTIFICATION
    // =================================================

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        {
          status: 404,
        }
      );
    }

    // =================================================
    // ALREADY READ
    // =================================================

    if (notification.isRead) {
      return NextResponse.json(
        {
          success: true,
          message: "Notification is already read",
          notification,
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =================================================

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },

        data: {
          isRead: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification marked as read",
        notification: updatedNotification,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH NOTIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification",
      },
      {
        status: 500,
      }
    );
  }
}