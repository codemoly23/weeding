import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { VendorCategory } from "@prisma/client";
import { createAdminNotification } from "@/lib/admin-notifications";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.vendorProfile.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// POST /api/vendor/register
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
  const category = typeof body.category === "string" && Object.values(VendorCategory).includes(body.category as VendorCategory)
    ? body.category as VendorCategory
    : undefined;
  const city = typeof body.city === "string" ? body.city : "";
  const country = typeof body.country === "string" ? body.country : "";
  const description = typeof body.description === "string" ? body.description : "";
  const tagline = typeof body.tagline === "string" ? body.tagline : "";

  if (!name || !email || !password || !businessName || !category) {
    return NextResponse.json(
      { error: "name, email, password, businessName, and valid category are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (password.length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });
  }

  const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/;
  if (!passwordComplexity.test(password)) {
    return NextResponse.json(
      { error: "Password must include uppercase, lowercase, a number, and a special character" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const slug = await uniqueSlug(slugify(businessName));

  // Create user + vendor profile in a transaction
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  let result;
  try {
  result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: "VENDOR",
      },
    });

    const profile = await tx.vendorProfile.create({
      data: {
        id: randomUUID(),
        slug,
        userId: user.id,
        businessName,
        category,
        description: description ? description.trim() : null,
        tagline: tagline ? tagline.trim() : null,
        city: city ? city.trim() : null,
        country: country ? country.trim() : "SE",
        status: "PENDING",
        isApproved: false,
        isActive: true,
        trialEndsAt,
      },
    });

    return { user, profile };
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[vendor/register] transaction error:", msg);
    return NextResponse.json({ error: "Server error: " + msg }, { status: 500 });
  }

  await createAdminNotification({
    type: "NEW_VENDOR",
    title: "New Vendor Registration",
    message: `${businessName} has registered and is awaiting approval.`,
    link: "/admin/vendors",
  });

  return NextResponse.json(
    {
      message: "Registration successful. Your listing is pending admin approval.",
      userId: result.user.id,
      profileId: result.profile.id,
    },
    { status: 201 }
  );
}
