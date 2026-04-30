import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority, Prisma } from "@prisma/client";
import { enhancedCreateLeadSchema } from "@/lib/leads/validation";

function parsePositiveInt(value: string | null, fallback: number, max?: number): number {
  const parsed = Number.parseInt(value || "", 10);
  const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(normalized, max) : normalized;
}

function isEnumValue<T extends string>(values: Record<string, T>, value: string): value is T {
  return Object.values(values).includes(value as T);
}

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// Calculate lead score based on various factors
function calculateLeadScore(data: {
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  budget?: string;
  timeline?: string;
  interestedIn?: string[];
  source?: LeadSource;
}): number {
  let score = 0;

  // Demographics (max 30)
  if (data.email) score += 5;
  if (data.phone) score += 10;
  if (data.company) score += 5;
  if (data.country && ["BD", "IN", "PK", "AE"].includes(data.country.toUpperCase())) {
    score += 10;
  }

  // Intent signals (max 40)
  if (data.budget) {
    if (data.budget.includes("2500") || data.budget.includes("5000")) score += 35;
    else if (data.budget.includes("1000")) score += 25;
    else if (data.budget.includes("500")) score += 15;
    else score += 5;
  }
  if (data.timeline) {
    if (data.timeline.includes("week") || data.timeline.includes("urgent")) score += 15;
    else if (data.timeline.includes("month")) score += 10;
  }

  // Service interest (max 20)
  if (data.interestedIn && data.interestedIn.length > 0) {
    const highValue = ["premium", "elite", "white-label"];
    const hasHighValue = data.interestedIn.some((s) => highValue.includes(s));
    if (hasHighValue) score += 15;
    if (data.interestedIn.length > 1) score += 5;
  }

  // Source bonus (max 15)
  if (data.source === "REFERRAL") score += 15;
  else if (data.source === "GOOGLE_ADS") score += 10;
  else if (data.source === "FACEBOOK_ADS") score += 5;

  return Math.min(score, 100);
}

// GET - List all leads with filters
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const scoreMin = searchParams.get("scoreMin");
    const scoreMax = searchParams.get("scoreMax");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 20, 100);
    const skip = (page - 1) * limit;
    const ALLOWED_SORT = new Set(["createdAt", "updatedAt", "score", "firstName", "lastName", "email", "status", "priority"]);
    const rawSort = searchParams.get("sortBy") || "createdAt";
    const sortBy = ALLOWED_SORT.has(rawSort) ? rawSort : "createdAt";
    const rawOrder = searchParams.get("sortOrder") || "desc";
    const sortOrder = rawOrder === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Prisma.LeadWhereInput = {};

    if (status && status !== "all") {
      if (!isEnumValue(LeadStatus, status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      where.status = status;
    }
    if (source && source !== "all") {
      if (!isEnumValue(LeadSource, source)) {
        return NextResponse.json({ error: "Invalid source value" }, { status: 400 });
      }
      where.source = source;
    }
    if (priority && priority !== "all") {
      if (!isEnumValue(LeadPriority, priority)) {
        return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
      }
      where.priority = priority;
    }
    if (assignedTo) {
      where.assignedToId = assignedTo === "unassigned" ? null : assignedTo;
    }
    if (scoreMin) {
      const value = Number.parseInt(scoreMin, 10);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return NextResponse.json({ error: "Invalid scoreMin value" }, { status: 400 });
      }
      const currentScoreFilter =
        typeof where.score === "object" && where.score !== null ? where.score as Prisma.IntFilter : {};
      where.score = { ...currentScoreFilter, gte: value };
    }
    if (scoreMax) {
      const value = Number.parseInt(scoreMax, 10);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return NextResponse.json({ error: "Invalid scoreMax value" }, { status: 400 });
      }
      const currentScoreFilter =
        typeof where.score === "object" && where.score !== null ? where.score as Prisma.IntFilter : {};
      where.score = { ...currentScoreFilter, lte: value };
    }
    if (dateFrom) {
      const d = new Date(dateFrom);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid dateFrom value" }, { status: 400 });
      }
      const currentDateFilter =
        typeof where.createdAt === "object" && where.createdAt !== null ? where.createdAt as Prisma.DateTimeFilter : {};
      where.createdAt = { ...currentDateFilter, gte: d };
    }
    if (dateTo) {
      const d = new Date(dateTo);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid dateTo value" }, { status: 400 });
      }
      const currentDateFilter =
        typeof where.createdAt === "object" && where.createdAt !== null ? where.createdAt as Prisma.DateTimeFilter : {};
      where.createdAt = { ...currentDateFilter, lte: d };
    }
    // Form template filter
    const formTemplateId = searchParams.get("formTemplateId");
    if (formTemplateId === "none") {
      where.formTemplateId = null;
    } else if (formTemplateId && formTemplateId !== "all") {
      where.formTemplateId = formTemplateId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy = { [sortBy]: sortOrder } as Prisma.LeadOrderByWithRelationInput;

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
          formTemplate: {
            select: { id: true, name: true },
          },
          _count: {
            select: { activities: true, leadNotes: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// Create lead schema imported from validation module (enhancedCreateLeadSchema)

// POST - Create a new lead (manual admin entry)
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;

    const body = await request.json();
    const data = enhancedCreateLeadSchema.parse(body);

    // Check for duplicate email (already normalized by schema transform)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: data.email,
        status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "A lead with this email already exists", existingLeadId: existingLead.id },
        { status: 409 }
      );
    }

    // Calculate score
    const score = calculateLeadScore({
      email: data.email,
      phone: data.phone,
      company: data.company,
      country: data.country,
      budget: data.budget,
      timeline: data.timeline,
      interestedIn: data.interestedIn,
      source: data.source as LeadSource,
    });

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        city: data.city,
        source: (data.source as LeadSource) || "WEBSITE",
        sourceDetail: data.sourceDetail,
        priority: (data.priority as LeadPriority) || "MEDIUM",
        interestedIn: data.interestedIn || [],
        budget: data.budget,
        timeline: data.timeline,
        notes: data.notes,
        customFields: data.customFields as Prisma.InputJsonValue | undefined,
        score,
        assignedToId: data.assignedToId,
        assignedAt: data.assignedToId ? new Date() : undefined,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        formTemplateId: data.formTemplateId,
        activities: {
          create: {
            type: "lead_created",
            description: "Lead created manually",
            performedById: session.user.id,
            metadata: { source: "admin" },
          },
        },
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
