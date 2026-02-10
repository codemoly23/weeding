import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// GET - Find duplicate leads by email
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    // Find emails that appear more than once
    const duplicateEmails = await prisma.lead.groupBy({
      by: ["email"],
      _count: { email: true },
      having: { email: { _count: { gt: 1 } } },
      orderBy: { _count: { email: "desc" } },
      take: 50,
    });

    if (duplicateEmails.length === 0) {
      return NextResponse.json({ groups: [], total: 0 });
    }

    // Fetch full lead data for each duplicate group
    const emails = duplicateEmails.map((d) => d.email);
    const leads = await prisma.lead.findMany({
      where: { email: { in: emails } },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { activities: true, leadNotes: true },
        },
      },
      orderBy: [{ email: "asc" }, { score: "desc" }, { createdAt: "asc" }],
    });

    // Group leads by email
    const groups = emails.map((email) => {
      const groupLeads = leads.filter((l) => l.email === email);
      return {
        email,
        count: groupLeads.length,
        leads: groupLeads,
      };
    });

    return NextResponse.json({
      groups,
      total: duplicateEmails.length,
    });
  } catch (error) {
    console.error("Error finding duplicate leads:", error);
    return NextResponse.json(
      { error: "Failed to find duplicates" },
      { status: 500 }
    );
  }
}
