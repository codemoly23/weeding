import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const clientIp = getClientIp(request);
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "unknown";

    const ipLimit = checkRateLimit(`auth:login:ip:${clientIp}`, 20, 15 * 60 * 1000);
    const emailLimit = checkRateLimit(`auth:login:email:${normalizedEmail}`, 8, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
      return NextResponse.json(
        { error: "Please use social login for this account" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Determine redirect URL based on role
    const staffRoles = ["ADMIN", "CONTENT_MANAGER", "SALES_AGENT", "SUPPORT_AGENT"];
    const redirectUrl = staffRoles.includes(user.role) ? "/admin" : "/dashboard";

    // Return user data (excluding password) and redirect URL
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
