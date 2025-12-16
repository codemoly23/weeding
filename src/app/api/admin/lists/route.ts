import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/lists - Get all lists (system + custom)
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const [systemLists, customLists] = await Promise.all([
      prisma.systemList.findMany({
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.customList.findMany({
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      systemLists: systemLists.map((list) => ({
        id: list.id,
        key: list.key,
        name: list.name,
        type: list.type,
        isEditable: list.isEditable,
        itemCount: list._count.items,
        category: "system",
      })),
      customLists: customLists.map((list) => ({
        id: list.id,
        key: list.key,
        name: list.name,
        description: list.description,
        itemCount: list._count.items,
        category: "custom",
      })),
    });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}
