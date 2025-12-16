import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/lists - Get list data (public)
// Query params:
//   - key: The list key (e.g., "countries", "us_states", "currencies")
//   - parentId: For hierarchical data (e.g., states of a country)
//   - search: Search term for filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search");

    if (!key) {
      return NextResponse.json(
        { error: "List key is required" },
        { status: 400 }
      );
    }

    // Try to find in system lists first
    const systemList = await prisma.systemList.findUnique({
      where: { key },
      include: {
        items: {
          where: {
            isActive: true,
            ...(parentId ? { parentId } : { parentId: null }),
            ...(search
              ? {
                  OR: [
                    { label: { contains: search, mode: "insensitive" as const } },
                    { value: { contains: search, mode: "insensitive" as const } },
                  ],
                }
              : {}),
          },
          orderBy: [
            { isPopular: "desc" },
            { order: "asc" },
            { label: "asc" },
          ],
        },
      },
    });

    if (systemList) {
      return NextResponse.json({
        key: systemList.key,
        name: systemList.name,
        type: systemList.type,
        items: systemList.items.map((item) => ({
          value: item.value,
          label: item.label,
          code: item.code,
          icon: item.icon,
          metadata: item.metadata,
          isPopular: item.isPopular,
        })),
      });
    }

    // Try custom lists
    const customList = await prisma.customList.findUnique({
      where: { key },
      include: {
        items: {
          where: {
            isActive: true,
            ...(search
              ? {
                  OR: [
                    { label: { contains: search, mode: "insensitive" as const } },
                    { value: { contains: search, mode: "insensitive" as const } },
                  ],
                }
              : {}),
          },
          orderBy: [
            { order: "asc" },
            { label: "asc" },
          ],
        },
      },
    });

    if (customList) {
      return NextResponse.json({
        key: customList.key,
        name: customList.name,
        type: "custom",
        items: customList.items.map((item) => ({
          value: item.value,
          label: item.label,
          metadata: item.metadata,
        })),
      });
    }

    return NextResponse.json(
      { error: "List not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}
