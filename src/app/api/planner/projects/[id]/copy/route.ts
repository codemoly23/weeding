import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const member = await prisma.projectMember.findFirst({
    where: { projectId: id, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const original = await prisma.weddingProject.findUnique({
    where: { id },
    include: {
      guests: true,
      budgetCategories: { include: { items: true } },
      checklistTasks: true,
      itineraryEvents: true,
      notes: true,
      eventVenues: true,
      vendors: true,
    },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create new project
  const newProject = await prisma.weddingProject.create({
    data: {
      title: `${original.title} (Copy)`,
      eventType: original.eventType,
      eventDate: original.eventDate,
      status: "DRAFT",
      brideName: original.brideName,
      groomName: original.groomName,
      budgetGoal: original.budgetGoal,
      settings: original.settings ?? undefined,
      userId: session.user.id,
    },
  });

  await prisma.projectMember.create({
    data: { projectId: newProject.id, userId: session.user.id, role: "OWNER" },
  });

  // Copy guests (clear RSVP tokens & answers)
  if (original.guests.length > 0) {
    await prisma.weddingGuest.createMany({
      data: original.guests.map((g) => ({
        projectId: newProject.id,
        firstName: g.firstName,
        lastName: g.lastName,
        title: g.title,
        side: g.side,
        relation: g.relation,
        email: g.email,
        phone: g.phone,
        dietary: g.dietary,
        rsvpStatus: "PENDING",
        tableNumber: g.tableNumber,
        notes: g.notes,
        hasPlusOne: g.hasPlusOne,
        plusOneName: g.plusOneName,
        plusOneMeal: g.plusOneMeal,
        isChiefGuest: g.isChiefGuest,
      })),
    });
  }

  // Copy budget categories + items
  for (const cat of original.budgetCategories) {
    const newCat = await prisma.budgetCategory.create({
      data: {
        projectId: newProject.id,
        name: cat.name,
        planned: cat.planned,
        color: cat.color,
        order: cat.order,
      },
    });
    if (cat.items.length > 0) {
      await prisma.budgetItem.createMany({
        data: cat.items.map((item) => ({
          categoryId: newCat.id,
          projectId: newProject.id,
          description: item.description,
          planned: item.planned,
          actual: 0,
          paid: 0,
          status: "UNPAID" as const,
          notes: item.notes,
          order: item.order,
        })),
      });
    }
  }

  // Copy checklist (reset completion)
  if (original.checklistTasks.length > 0) {
    await prisma.checklistTask.createMany({
      data: original.checklistTasks.map((t) => ({
        projectId: newProject.id,
        title: t.title,
        description: t.description,
        subtasks: t.subtasks ?? Prisma.JsonNull,
        dueMonths: t.dueMonths,
        category: t.category,
        completed: false,
        isDefault: t.isDefault,
        order: t.order,
      })),
    });
  }

  // Copy itinerary
  if (original.itineraryEvents.length > 0) {
    await prisma.itineraryEvent.createMany({
      data: original.itineraryEvents.map((e) => ({
        projectId: newProject.id,
        title: e.title,
        description: e.description,
        startTime: e.startTime,
        endTime: e.endTime,
        location: e.location,
        category: e.category,
        order: e.order,
      })),
    });
  }

  // Copy notes
  if (original.notes.length > 0) {
    await prisma.projectNote.createMany({
      data: original.notes.map((n) => ({
        projectId: newProject.id,
        title: n.title,
        content: n.content,
        order: n.order,
      })),
    });
  }

  // Copy venues
  for (const venue of original.eventVenues) {
    await prisma.eventVenue.create({
      data: {
        projectId: newProject.id,
        type: venue.type,
        venueName: venue.venueName,
        address: venue.address,
        city: venue.city,
        country: venue.country,
        date: venue.date,
        time: venue.time,
        capacity: venue.capacity,
        description: venue.description,
        notes: venue.notes,
        layoutNotes: venue.layoutNotes,
      },
    });
  }

  // Copy vendors
  if (original.vendors.length > 0) {
    await prisma.weddingVendor.createMany({
      data: original.vendors.map((v) => ({
        projectId: newProject.id,
        name: v.name,
        category: v.category,
        email: v.email,
        phone: v.phone,
        website: v.website,
        notes: v.notes,
      })),
    });
  }

  return NextResponse.json({ projectId: newProject.id });
}
