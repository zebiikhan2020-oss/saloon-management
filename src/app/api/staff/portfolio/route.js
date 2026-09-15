import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

// ==========================================
// GET STAFF FROM TOKEN
// ==========================================

async function getStaffFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    if (!payload.id || payload.role !== "STAFF") {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("STAFF TOKEN ERROR:", error);
    return null;
  }
}

// ==========================================
// SAVE IMAGE
// ==========================================

async function saveImage(file) {
  if (!file || typeof file === "string") {
    return null;
  }

  if (!file.name || file.size === 0) {
    return null;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, JPEG, PNG and WEBP images are allowed"
    );
  }

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB");
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "portfolio"
  );

  await fs.mkdir(uploadDir, {
    recursive: true,
  });

  const extension = path.extname(file.name);

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}${extension}`;

  const filePath = path.join(
    uploadDir,
    fileName
  );

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await fs.writeFile(filePath, buffer);

  return `/uploads/portfolio/${fileName}`;
}

// ==========================================
// DELETE IMAGE FILE
// ==========================================

async function deleteImage(imageUrl) {
  if (
    !imageUrl ||
    !imageUrl.startsWith("/uploads/portfolio/")
  ) {
    return;
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      imageUrl
    );

    await fs.unlink(filePath);
  } catch (error) {
    console.log(
      "IMAGE DELETE SKIPPED:",
      error.message
    );
  }
}

// ==========================================
// GET - STAFF PORTFOLIO
// ==========================================

export async function GET(request) {
  try {
    const staff = await getStaffFromToken(request);

    if (!staff) {
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

    const portfolio =
      await prisma.staffPortfolio.findMany({
        where: {
          staffId: staff.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        success: true,
        portfolio,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET STAFF PORTFOLIO ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch portfolio",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST - ADD PORTFOLIO
// ==========================================

export async function POST(request) {
  try {
    const staff = await getStaffFromToken(request);

    if (!staff) {
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

    const formData = await request.formData();

    const title = formData
      .get("title")
      ?.toString()
      .trim();

    const description = formData
      .get("description")
      ?.toString()
      .trim();

    const priceValue = formData
      .get("price")
      ?.toString()
      .trim();

    const image = formData.get("image");

    // ==========================================
    // VALIDATE TITLE
    // ==========================================

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Work title is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VALIDATE PRICE
    // ==========================================

    const price = Number(priceValue);

    if (
      !priceValue ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid price is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VALIDATE IMAGE
    // ==========================================

    if (!image || typeof image === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Portfolio image is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // SAVE IMAGE
    // ==========================================

    const imageUrl = await saveImage(image);

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save image",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CREATE PORTFOLIO
    // ==========================================

    const portfolio =
      await prisma.staffPortfolio.create({
        data: {
          staffId: staff.id,
          title,
          description: description || null,
          imageUrl,
          price,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Work added successfully",
        portfolio,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST STAFF PORTFOLIO ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to add work",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PUT - UPDATE PORTFOLIO
// ==========================================

export async function PUT(request) {
  try {
    const staff = await getStaffFromToken(request);

    if (!staff) {
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

    const formData = await request.formData();

    const id = formData
      .get("id")
      ?.toString();

    const title = formData
      .get("title")
      ?.toString()
      .trim();

    const description = formData
      .get("description")
      ?.toString()
      .trim();

    const priceValue = formData
      .get("price")
      ?.toString()
      .trim();

    const image = formData.get("image");

    // ==========================================
    // VALIDATE ID + TITLE
    // ==========================================

    if (!id || !title) {
      return NextResponse.json(
        {
          success: false,
          message: "ID and title are required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VALIDATE PRICE
    // ==========================================

    const price = Number(priceValue);

    if (
      !priceValue ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid price is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================

    const existingPortfolio =
      await prisma.staffPortfolio.findFirst({
        where: {
          id,
          staffId: staff.id,
        },
      });

    if (!existingPortfolio) {
      return NextResponse.json(
        {
          success: false,
          message: "Work not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // KEEP OLD IMAGE
    // ==========================================

    let imageUrl =
      existingPortfolio.imageUrl;

    // ==========================================
    // NEW IMAGE SELECTED
    // ==========================================

    if (
      image &&
      typeof image !== "string" &&
      image.size > 0
    ) {
      const newImageUrl =
        await saveImage(image);

      if (newImageUrl) {
        await deleteImage(
          existingPortfolio.imageUrl
        );

        imageUrl = newImageUrl;
      }
    }

    // ==========================================
    // UPDATE PORTFOLIO
    // ==========================================

    const portfolio =
      await prisma.staffPortfolio.update({
        where: {
          id,
        },
        data: {
          title,
          description:
            description || null,
          imageUrl,
          price,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Work updated successfully",
        portfolio,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PUT STAFF PORTFOLIO ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to update work",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE - PORTFOLIO
// ==========================================

export async function DELETE(request) {
  try {
    const staff = await getStaffFromToken(request);

    if (!staff) {
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

    const id = body.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Portfolio ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================

    const existingPortfolio =
      await prisma.staffPortfolio.findFirst({
        where: {
          id,
          staffId: staff.id,
        },
      });

    if (!existingPortfolio) {
      return NextResponse.json(
        {
          success: false,
          message: "Work not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // DELETE IMAGE
    // ==========================================

    await deleteImage(
      existingPortfolio.imageUrl
    );

    // ==========================================
    // DELETE DATABASE RECORD
    // ==========================================

    await prisma.staffPortfolio.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Work deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE STAFF PORTFOLIO ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete work",
      },
      {
        status: 500,
      }
    );
  }
}