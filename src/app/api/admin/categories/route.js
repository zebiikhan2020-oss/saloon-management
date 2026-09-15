import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET CATEGORIES
// =====================================================

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories, {
      status: 200,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// CREATE CATEGORY
// =====================================================

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          message: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const categoryName = name.trim();

    // =================================================
    // CHECK EXISTING CATEGORY
    // =================================================

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          name: categoryName,
        },
      });

    // =================================================
    // IF CATEGORY EXISTS BUT INACTIVE
    // =================================================

    if (
      existingCategory &&
      !existingCategory.isActive
    ) {
      const restoredCategory =
        await prisma.category.update({
          where: {
            id: existingCategory.id,
          },

          data: {
            isActive: true,
          },
        });

      return NextResponse.json(
        {
          message:
            "Category already existed and has been restored.",
          category: restoredCategory,
        },
        {
          status: 200,
        }
      );
    }

    // =================================================
    // CATEGORY ALREADY ACTIVE
    // =================================================

    if (existingCategory) {
      return NextResponse.json(
        {
          message: "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    // =================================================
    // CREATE NEW CATEGORY
    // =================================================

    const category =
      await prisma.category.create({
        data: {
          name: categoryName,
          isActive: true,
        },
      });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}