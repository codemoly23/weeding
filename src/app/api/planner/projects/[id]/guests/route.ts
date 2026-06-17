import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { plannerProjectWhere } from "@/lib/planner-access";
import { z } from "zod";
import { assignGuestsToTableNumber } from "@/lib/seating-sync";

const emptyToUndefined = (value: unknown) =>
  value === undefined || value === null || value === "" ? undefined : value;

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max).optional()
  );

const optionalDate = z.preprocess(
  (value) => (value === undefined || value === null || value === "" ? undefined : new Date(String(value))),
  z.date().optional()
);

const optionalTableNumber = z.preprocess(
  (value) => (value === undefined || value === null || value === "" ? undefined : Number(value)),
  z.number().int().min(1).max(500).optional()
);

const guestCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: optionalTrimmedString(100),
  title: optionalTrimmedString(50),
  side: z.enum(["BRIDE", "GROOM"]).default("BRIDE"),
  relation: z.enum([
    "BRIDE",
    "GROOM",
    "MAID_OF_HONOR",
    "MATRON_OF_HONOR",
    "BRIDESMAID",
    "BEST_MAN",
    "GROOMSMAN",
    "PARENT",
    "CLOSE_RELATIVE",
    "RELATIVE",
    "CLOSE_FRIEND",
    "FRIEND",
    "PARTNER",
    "OTHER",
  ]).default("OTHER"),
  email: z.preprocess(emptyToUndefined, z.string().trim().email().max(254).optional()),
  phone: optionalTrimmedString(50),
  dietary: optionalTrimmedString(500),
  tableNumber: optionalTableNumber,
  notes: optionalTrimmedString(2000),
  hasPlusOne: z.boolean().optional().default(false),
  plusOneName: optionalTrimmedString(100),
  plusOneMeal: optionalTrimmedString(500),
  isChiefGuest: z.boolean().optional().default(false),
  familyId: optionalTrimmedString(100),
  invitationCode: optionalTrimmedString(100),
  invitationSent: z.boolean().optional().default(false),
  invitationSentAt: optionalDate,
});

// GET /api/planner/projects/[id]/guests
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: plannerProjectWhere(id, session.user.id, session.user.role as string),
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guests = await prisma.weddingGuest.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });

  return NextResponse.json({ guests });
}

// POST /api/planner/projects/[id]/guests
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = guestCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid guest data", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const guestFields = {
    firstName: data.firstName,
    lastName: data.lastName || null,
    title: data.title || null,
    side: data.side,
    relation: data.relation,
    phone: data.phone || null,
    dietary: data.dietary || null,
    notes: data.notes || null,
    hasPlusOne: data.hasPlusOne,
    plusOneName: data.hasPlusOne ? data.plusOneName || null : null,
    plusOneMeal: data.hasPlusOne ? data.plusOneMeal || null : null,
    isChiefGuest: data.isChiefGuest,
    familyId: data.familyId || null,
    invitationCode: data.invitationCode || null,
    invitationSent: data.invitationSent,
    invitationSentAt: data.invitationSentAt || null,
  };

  let guest;
  try {
    guest = await prisma.$transaction(async (tx) => {
      const upserted = data.email
        ? await tx.weddingGuest.upsert({
            where: { projectId_email: { projectId: id, email: data.email } },
            create: { projectId: id, email: data.email, ...guestFields },
            update: guestFields,
          })
        : await tx.weddingGuest.create({
            data: { projectId: id, email: null, ...guestFields },
          });

      if (data.tableNumber) {
        await assignGuestsToTableNumber(tx, id, [upserted.id], data.tableNumber);
        return tx.weddingGuest.findUniqueOrThrow({ where: { id: upserted.id } });
      }

      return upserted;
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }

  return NextResponse.json({ guest }, { status: 201 });
}
