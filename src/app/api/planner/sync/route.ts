import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GuestSide, GuestRelation, RsvpStatus, BudgetPaymentStatus, VendorCategory, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { syncLayoutGuestTableNumbers } from "@/lib/seating-sync";

// POST /api/planner/sync — migrate a local (localStorage) project into the DB
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const {
    localId, title, role, eventType, eventDate, budgetGoal, brideName, groomName,
    guests, families, budget, checklist, itinerary, notes, vendors, ceremony, reception, seatingLayouts,
  } = body;

  if (!localId || !role) {
    return NextResponse.json({ error: "localId and role are required" }, { status: 400 });
  }

  if (typeof localId !== "string" || !localId.startsWith("local-")) {
    return NextResponse.json({ error: "Invalid localId" }, { status: 400 });
  }

  if (!["BRIDE", "GROOM", "PLANNER", "OTHER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${session.user.id}:${localId}`}))`;

    const existing = await tx.weddingProject.findFirst({
      where: {
        userId: session.user.id,
        sourceLocalId: localId,
      },
    });

    if (existing) {
      return { project: existing, alreadySynced: true };
    }

    // 1. Create the project
    const proj = await tx.weddingProject.create({
      data: {
        title: title || "Untitled",
        eventType: eventType || "WEDDING",
        eventDate: eventDate ? new Date(eventDate) : null,
        budgetGoal: budgetGoal ? Number(budgetGoal) : 0,
        brideName: brideName || null,
        groomName: groomName || null,
        userId: session.user.id,
        sourceLocalId: localId,
        members: {
          create: {
            userId: session.user.id,
            role,
            displayName: session.user.name || undefined,
          },
        },
      },
    });

    const pid = proj.id;

    // 2. Families — build local→db ID map for guest FK resolution
    const familyIdMap: Record<string, string> = {};
    if (Array.isArray(families) && families.length > 0) {
      for (const f of families) {
        const dbFamily = await tx.guestFamily.create({
          data: { projectId: pid, name: f.name },
        });
        familyIdMap[f.id] = dbFamily.id;
      }
    }

    // 3. Guests
    const guestIdMap: Record<string, string> = {};
    if (Array.isArray(guests) && guests.length > 0) {
      for (const g of guests as Record<string, unknown>[]) {
        const dbGuest = await tx.weddingGuest.create({
          data: {
            projectId: pid,
            firstName: (g.firstName as string)?.trim() || "",
            lastName: (g.lastName as string)?.trim() || null,
            title: (g.title as string)?.trim() || null,
            side: (g.side as string || "BRIDE") as GuestSide,
            relation: (g.relation as string || "OTHER") as GuestRelation,
            email: (g.email as string)?.trim() || null,
            phone: (g.phone as string)?.trim() || null,
            dietary: (g.dietary as string)?.trim() || null,
            notes: (g.notes as string)?.trim() || null,
            hasPlusOne: (g.hasPlusOne as boolean) ?? false,
            plusOneName: (g.plusOneName as string)?.trim() || null,
            plusOneMeal: (g.plusOneMeal as string)?.trim() || null,
            isChiefGuest: (g.isChiefGuest as boolean) ?? false,
            gdprConsentAt: g.gdprConsentAt ? new Date(g.gdprConsentAt as string) : null,
            selfRegistered: (g.selfRegistered as boolean) ?? false,
            familyId: g.familyId ? (familyIdMap[g.familyId as string] ?? null) : null,
            invitationCode: (g.invitationCode as string)?.trim() || null,
            invitationSent: (g.invitationSent as boolean) ?? false,
            invitationSentAt: g.invitationSentAt ? new Date(g.invitationSentAt as string) : null,
            rsvpStatus: (g.rsvpStatus as string || "PENDING") as RsvpStatus,
          },
        });

        if (typeof g.id === "string") {
          guestIdMap[g.id] = dbGuest.id;
        }
      }
    }

    // 3b. Seating layouts + tables. Seating tables are the source of truth for table assignment.
    if (Array.isArray(seatingLayouts) && seatingLayouts.length > 0) {
      for (const layout of seatingLayouts as Record<string, unknown>[]) {
        const dbLayout = await tx.seatingLayout.create({
          data: {
            projectId: pid,
            name: (layout.name as string) || "Layout",
            type: (layout.type as string) || "RECEPTION",
            width: Number(layout.width) || 1200,
            height: Number(layout.height) || 800,
            bgColor: (layout.bgColor as string) || "#f5f5f0",
          },
        });

        const tables = layout.tables as Record<string, unknown>[];
        if (Array.isArray(tables) && tables.length > 0) {
          for (const table of tables) {
            const guestIds = Array.isArray(table.guestIds)
              ? table.guestIds
                  .map((guestId) => typeof guestId === "string" ? guestIdMap[guestId] : null)
                  .filter((guestId): guestId is string => Boolean(guestId))
              : [];

            await tx.seatingTable.create({
              data: {
                projectId: pid,
                layoutId: dbLayout.id,
                name: (table.name as string) || "Table",
                type: (table.type as string) || "ROUND",
                x: Number(table.x) || 100,
                y: Number(table.y) || 100,
                seats: Number(table.seats) || 8,
                rotation: Number(table.rotation) || 0,
                color: (table.color as string) || "#ffffff",
                guestIds,
              },
            });
          }
        }

        await syncLayoutGuestTableNumbers(tx, pid, dbLayout.id);
      }
    }

    // 4. Budget categories + items
    if (Array.isArray(budget) && budget.length > 0) {
      for (const cat of budget as Record<string, unknown>[]) {
        const dbCat = await tx.budgetCategory.create({
          data: {
            projectId: pid,
            name: cat.name as string,
            planned: Number(cat.planned) || 0,
            color: (cat.color as string) ?? "#6366f1",
            order: Number(cat.order) || 0,
          },
        });
        const items = cat.items as Record<string, unknown>[];
        if (Array.isArray(items) && items.length > 0) {
          await tx.budgetItem.createMany({
            data: items.map((item, i) => ({
              projectId: pid,
              categoryId: dbCat.id,
              description: (item.description as string)?.trim() || "Item",
              planned: Number(item.planned) || 0,
              actual: Number(item.actual) || 0,
              paid: Number(item.paid) || 0,
              status: ((item.status as string) ?? "UNPAID") as BudgetPaymentStatus,
              notes: (item.notes as string) ?? null,
              order: Number(item.order) || i,
            })),
          });
        }
      }
    }

    // 5. Checklist tasks
    if (Array.isArray(checklist) && checklist.length > 0) {
      await tx.checklistTask.createMany({
        data: (checklist as Record<string, unknown>[]).map((t, i) => ({
          projectId: pid,
          title: (t.title as string) || "Task",
          description: (t.description as string) ?? null,
          subtasks: (t.subtasks as object[]) ?? [],
          dueMonths: t.dueMonths != null ? Number(t.dueMonths) : null,
          category: (t.category as string) ?? null,
          isDefault: (t.isDefault as boolean) ?? false,
          completed: (t.completed as boolean) ?? false,
          completedAt: t.completedAt ? new Date(t.completedAt as string) : null,
          order: Number(t.order) || i,
        })),
      });
    }

    // 6. Itinerary events
    if (Array.isArray(itinerary) && itinerary.length > 0) {
      await tx.itineraryEvent.createMany({
        data: (itinerary as Record<string, unknown>[]).map((e, i) => ({
          projectId: pid,
          title: (e.title as string) || "Event",
          description: (e.description as string) ?? null,
          startTime: e.startTime as string,
          endTime: (e.endTime as string) ?? null,
          location: (e.location as string) ?? null,
          category: (e.category as string) ?? null,
          order: Number(e.order) || i,
        })),
      });
    }

    // 7. Notes
    if (Array.isArray(notes) && notes.length > 0) {
      await tx.projectNote.createMany({
        data: (notes as Record<string, unknown>[]).map((n, i) => ({
          projectId: pid,
          title: (n.title as string) || "Note",
          content: (n.content as string) ?? "",
          order: Number(n.order) || i,
        })),
      });
    }

    // 8. Vendors
    if (Array.isArray(vendors) && vendors.length > 0) {
      await tx.weddingVendor.createMany({
        data: (vendors as Record<string, unknown>[]).map((v) => ({
          projectId: pid,
          name: (v.name as string)?.trim() || "Vendor",
          category: v.category as VendorCategory,
          email: (v.email as string)?.trim() || null,
          phone: (v.phone as string)?.trim() || null,
          website: (v.website as string)?.trim() || null,
          notes: (v.notes as string)?.trim() || null,
        })),
      });
    }

    // 9. Ceremony venue (only if has any data)
    if (ceremony && (ceremony.venueName || ceremony.address || ceremony.city || ceremony.date)) {
      await tx.eventVenue.create({
        data: {
          projectId: pid,
          type: "CEREMONY",
          venueName: ceremony.venueName ?? null,
          address: ceremony.address ?? null,
          city: ceremony.city ?? null,
          country: ceremony.country ?? null,
          date: ceremony.date ? new Date(ceremony.date) : null,
          time: ceremony.time ?? null,
          capacity: ceremony.capacity ? Number(ceremony.capacity) : null,
          description: ceremony.description ?? null,
          notes: ceremony.notes ?? null,
          layoutNotes: ceremony.layoutNotes ?? null,
        },
      });
    }

    // 10. Reception venue (only if has any data)
    if (reception && (reception.venueName || reception.address || reception.city || reception.date)) {
      await tx.eventVenue.create({
        data: {
          projectId: pid,
          type: "RECEPTION",
          venueName: reception.venueName ?? null,
          address: reception.address ?? null,
          city: reception.city ?? null,
          country: reception.country ?? null,
          date: reception.date ? new Date(reception.date) : null,
          time: reception.time ?? null,
          capacity: reception.capacity ? Number(reception.capacity) : null,
          description: reception.description ?? null,
          notes: reception.notes ?? null,
          layoutNotes: reception.layoutNotes ?? null,
        },
      });
    }

    return { project: proj, alreadySynced: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return NextResponse.json(result, { status: result.alreadySynced ? 200 : 201 });
}
