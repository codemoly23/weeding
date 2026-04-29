import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getVendorProfile(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId } });
}

// GET /api/vendor/profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getVendorProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

// PUT /api/vendor/profile
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getVendorProfile(session.user.id);
  if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const {
    businessName, category, description, tagline, email, phone, website,
    instagram, facebook, pinterest, slaHours, faqItems,
    city, country, lat, lng, serviceRadiusKm, photos, videoUrls,
    startingPrice, priceMin, priceMax, currency, yearsInBusiness, languages,
  } = body;

  if (lat !== undefined && lat !== null && lat !== "") {
    const n = parseFloat(lat);
    if (isNaN(n) || n < -90 || n > 90) return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
  }
  if (lng !== undefined && lng !== null && lng !== "") {
    const n = parseFloat(lng);
    if (isNaN(n) || n < -180 || n > 180) return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
  }
  if (slaHours !== undefined && slaHours !== null && slaHours !== "") {
    const n = parseInt(slaHours);
    if (isNaN(n) || n < 1 || n > 720) return NextResponse.json({ error: "slaHours must be 1–720" }, { status: 400 });
  }
  if (serviceRadiusKm !== undefined && serviceRadiusKm !== null && serviceRadiusKm !== "") {
    const n = parseInt(serviceRadiusKm);
    if (isNaN(n) || n < 1 || n > 5000) return NextResponse.json({ error: "serviceRadiusKm must be 1–5000" }, { status: 400 });
  }
  if (yearsInBusiness !== undefined && yearsInBusiness !== null && yearsInBusiness !== "") {
    const n = parseInt(yearsInBusiness);
    if (isNaN(n) || n < 0 || n > 100) return NextResponse.json({ error: "yearsInBusiness must be 0–100" }, { status: 400 });
  }
  for (const [field, val] of [["startingPrice", startingPrice], ["priceMin", priceMin], ["priceMax", priceMax]] as const) {
    if (val !== undefined && val !== null && val !== "") {
      const n = parseInt(val);
      if (isNaN(n) || n < 0) return NextResponse.json({ error: `${field} must be a non-negative number` }, { status: 400 });
    }
  }

  const profile = await prisma.vendorProfile.update({
    where: { id: existing.id },
    data: {
      ...(businessName !== undefined && { businessName: String(businessName).trim() }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description: description ? String(description).trim() : null }),
      ...(tagline !== undefined && { tagline: tagline ? String(tagline).trim() : null }),
      ...(email !== undefined && { email: email ? String(email).trim() : null }),
      ...(phone !== undefined && { phone: phone ? String(phone).trim() : null }),
      ...(website !== undefined && { website: website ? String(website).trim() : null }),
      ...(instagram !== undefined && { instagram: instagram ? String(instagram).trim() : null }),
      ...(facebook !== undefined && { facebook: facebook ? String(facebook).trim() : null }),
      ...(pinterest !== undefined && { pinterest: pinterest ? String(pinterest).trim() : null }),
      ...(slaHours !== undefined && { slaHours: slaHours ? parseInt(slaHours) : null }),
      ...(faqItems !== undefined && { faqItems: Array.isArray(faqItems) ? faqItems : [] }),
      ...(city !== undefined && { city: city ? String(city).trim() : null }),
      ...(country !== undefined && { country: String(country).trim() }),
      ...(lat !== undefined && { lat: lat !== null && lat !== "" ? parseFloat(lat) : null }),
      ...(lng !== undefined && { lng: lng !== null && lng !== "" ? parseFloat(lng) : null }),
      ...(serviceRadiusKm !== undefined && { serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : null }),
      ...(photos !== undefined && { photos: Array.isArray(photos) ? photos : [] }),
      ...(videoUrls !== undefined && { videoUrls: Array.isArray(videoUrls) ? videoUrls : [] }),
      ...(startingPrice !== undefined && { startingPrice: startingPrice ? parseInt(startingPrice) : null }),
      ...(priceMin !== undefined && { startingPrice: priceMin ? parseInt(priceMin) : null }),
      ...(priceMax !== undefined && { maxPrice: priceMax ? parseInt(priceMax) : null }),
      ...(currency !== undefined && { currency: String(currency) }),
      ...(yearsInBusiness !== undefined && { yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null }),
      ...(languages !== undefined && { languages: Array.isArray(languages) ? languages : [] }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ profile });
}
