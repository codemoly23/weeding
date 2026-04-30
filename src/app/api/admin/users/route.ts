import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

// GET /api/admin/users - List all users (Admin only, or team members for sales/support)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roles = searchParams.get("roles"); // comma-separated roles

    const requestedRoles = roles
      ? roles.split(",").map((value) => value.trim()).filter(Boolean)
      : [];
    const teamAssignableRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];

    // If fetching team members (for assignment), allow sales/support agents
    if (roles) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (requestedRoles.some((requestedRole) => !teamAssignableRoles.includes(requestedRole))) {
        return NextResponse.json({ error: "Forbidden role filter" }, { status: 403 });
      }
    } else {
      // Full user management requires admin
      const accessCheck = await checkAdminOnly();
      if ("error" in accessCheck) {
        return authError(accessCheck);
      }
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // "active" | "inactive" | "all"

    const where: Record<string, unknown> = {};

    // Filter by single role
    if (role && role !== "all") {
      where.role = role;
    }
    // Filter by multiple roles
    if (roles) {
      where.role = { in: requestedRoles };
    }

    // Filter by active status
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            customerTickets: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    const [totalCount, activeCount, inactiveCount, roleStats] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    ]);

    const stats = {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      byRole: Object.fromEntries(roleStats.map(r => [r.role, r._count.id])),
    };

    return NextResponse.json({
      users,
      stats,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
