import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const mergeSchema = z.object({
  primaryId: z.string().min(1, "Primary lead ID required"),
  secondaryIds: z.array(z.string()).min(1, "At least one secondary lead required"),
});

// POST - Merge duplicate leads into primary
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }
    const session = accessCheck.session!;

    const body = await request.json();
    const { primaryId, secondaryIds } = mergeSchema.parse(body);

    // Ensure primary is not in secondary list
    if (secondaryIds.includes(primaryId)) {
      return NextResponse.json(
        { error: "Primary lead cannot be in secondary list" },
        { status: 400 }
      );
    }

    // Fetch all leads
    const allIds = [primaryId, ...secondaryIds];
    const leads = await prisma.lead.findMany({
      where: { id: { in: allIds } },
      include: {
        _count: { select: { activities: true, leadNotes: true } },
      },
    });

    const primary = leads.find((l) => l.id === primaryId);
    if (!primary) {
      return NextResponse.json({ error: "Primary lead not found" }, { status: 404 });
    }

    const secondaries = leads.filter((l) => secondaryIds.includes(l.id));
    if (secondaries.length === 0) {
      return NextResponse.json({ error: "No secondary leads found" }, { status: 404 });
    }

    // Merge in transaction
    const mergedLead = await prisma.$transaction(async (tx) => {
      // 1. Keep highest score
      const maxScore = Math.max(primary.score, ...secondaries.map((s) => s.score));

      // 2. Combine interestedIn arrays (deduplicated)
      const allInterests = new Set<string>([
        ...primary.interestedIn,
        ...secondaries.flatMap((s) => s.interestedIn),
      ]);

      // 3. Merge custom fields (primary takes precedence)
      let mergedCustomFields: Record<string, unknown> = {};
      for (const secondary of secondaries) {
        if (secondary.customFields && typeof secondary.customFields === "object") {
          mergedCustomFields = { ...mergedCustomFields, ...(secondary.customFields as Record<string, unknown>) };
        }
      }
      if (primary.customFields && typeof primary.customFields === "object") {
        mergedCustomFields = { ...mergedCustomFields, ...(primary.customFields as Record<string, unknown>) };
      }

      // 4. Fill in missing fields from secondaries
      const fillFields = {
        phone: primary.phone || secondaries.find((s) => s.phone)?.phone,
        company: primary.company || secondaries.find((s) => s.company)?.company,
        country: primary.country || secondaries.find((s) => s.country)?.country,
        city: primary.city || secondaries.find((s) => s.city)?.city,
        budget: primary.budget || secondaries.find((s) => s.budget)?.budget,
        timeline: primary.timeline || secondaries.find((s) => s.timeline)?.timeline,
        lastName: primary.lastName || secondaries.find((s) => s.lastName)?.lastName,
      };

      // 5. Aggregate engagement metrics
      const totalPageViews = primary.pageViews + secondaries.reduce((sum, s) => sum + s.pageViews, 0);
      const totalVisitCount = primary.visitCount + secondaries.reduce((sum, s) => sum + s.visitCount, 0);

      // 6. Transfer activities from secondaries to primary
      await tx.leadActivity.updateMany({
        where: { leadId: { in: secondaryIds } },
        data: { leadId: primaryId },
      });

      // 7. Transfer notes from secondaries to primary
      await tx.leadNote.updateMany({
        where: { leadId: { in: secondaryIds } },
        data: { leadId: primaryId },
      });

      // 8. Create merge activity log
      await tx.leadActivity.create({
        data: {
          leadId: primaryId,
          type: "leads_merged",
          description: `Merged ${secondaries.length} duplicate lead(s) into this record`,
          performedById: session.user.id,
          metadata: {
            mergedLeadIds: secondaryIds,
            mergedEmails: secondaries.map((s) => s.email),
          },
        },
      });

      // 9. Update primary with merged data
      const updated = await tx.lead.update({
        where: { id: primaryId },
        data: {
          score: maxScore,
          interestedIn: Array.from(allInterests),
          customFields: Object.keys(mergedCustomFields).length > 0
            ? mergedCustomFields as Prisma.InputJsonValue
            : primary.customFields !== null
              ? primary.customFields as Prisma.InputJsonValue
              : undefined,
          pageViews: totalPageViews,
          visitCount: totalVisitCount,
          lastActivityAt: new Date(),
          scoreDecayDays: 0,
          ...fillFields,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 10. Delete secondary leads
      await tx.lead.deleteMany({
        where: { id: { in: secondaryIds } },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      lead: mergedLead,
      mergedCount: secondaries.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error merging leads:", error);
    return NextResponse.json(
      { error: "Failed to merge leads" },
      { status: 500 }
    );
  }
}
