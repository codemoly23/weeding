import { Prisma } from "@prisma/client";

type SeatingTableSnapshot = {
  id: string;
  name: string;
  guestIds: Prisma.JsonValue;
};

function toGuestIds(value: Prisma.JsonValue | unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))];
}

function tableNumberFor(table: SeatingTableSnapshot, index: number): number {
  const match = table.name.match(/\d+/);
  return match ? Number(match[0]) : index + 1;
}

export function normalizeGuestIds(value: unknown): string[] {
  return toGuestIds(value);
}

export async function applyTableGuestIds(
  tx: Prisma.TransactionClient,
  projectId: string,
  layoutId: string,
  tableId: string,
  guestIds: string[]
) {
  const validGuests = await tx.weddingGuest.findMany({
    where: { projectId, id: { in: guestIds } },
    select: { id: true },
  });
  const validIds = new Set(validGuests.map((guest) => guest.id));
  const nextGuestIds = guestIds.filter((id) => validIds.has(id));

  const tables = await tx.seatingTable.findMany({
    where: { projectId, layoutId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, name: true, guestIds: true },
  });

  const updatedTables = tables.map((table) => {
    if (table.id === tableId) return { ...table, guestIds: nextGuestIds };
    return {
      ...table,
      guestIds: toGuestIds(table.guestIds).filter((id) => !validIds.has(id)),
    };
  });

  for (const table of updatedTables) {
    await tx.seatingTable.update({
      where: { id: table.id },
      data: { guestIds: table.guestIds },
    });
  }

  await syncGuestTableNumbers(tx, projectId, updatedTables);
}

export async function syncLayoutGuestTableNumbers(
  tx: Prisma.TransactionClient,
  projectId: string,
  layoutId: string
) {
  const tables = await tx.seatingTable.findMany({
    where: { projectId, layoutId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, name: true, guestIds: true },
  });

  await syncGuestTableNumbers(tx, projectId, tables);
}

async function syncGuestTableNumbers(
  tx: Prisma.TransactionClient,
  projectId: string,
  tables: SeatingTableSnapshot[]
) {
  const assignment = new Map<string, number>();

  tables.forEach((table, index) => {
    const number = tableNumberFor(table, index);
    for (const guestId of toGuestIds(table.guestIds)) {
      assignment.set(guestId, number);
    }
  });

  const assignedIds = [...assignment.keys()];
  await tx.weddingGuest.updateMany({
    where: { projectId, ...(assignedIds.length > 0 ? { id: { notIn: assignedIds } } : {}) },
    data: { tableNumber: null },
  });

  const byTableNumber = new Map<number, string[]>();
  for (const [guestId, tableNumber] of assignment) {
    byTableNumber.set(tableNumber, [...(byTableNumber.get(tableNumber) || []), guestId]);
  }

  for (const [tableNumber, guestIds] of byTableNumber) {
    await tx.weddingGuest.updateMany({
      where: { projectId, id: { in: guestIds } },
      data: { tableNumber },
    });
  }
}
