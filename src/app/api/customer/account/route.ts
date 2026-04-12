import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// DELETE /api/customer/account — permanently delete the authenticated user's account
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Require password confirmation
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: "Password is required to delete your account" }, { status: 400 });
  }

  // Verify password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If user has a password, verify it
  if (user.password) {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }
  }

  try {
    // Delete in order to satisfy FK constraints
    // Step 1: Wedding planner data (WeddingProject cascades all child records)
    await prisma.weddingProject.deleteMany({ where: { userId } });
    await prisma.projectMember.deleteMany({ where: { userId } });

    // Step 2: Vendor data (VendorConversation.coupleUserId has onDelete: SetNull, auto-handled)
    // VendorProfile cascades to VendorAvailability, VendorInquiry, VendorReview, VendorConversation
    await prisma.vendorProfile.deleteMany({ where: { userId } });

    // Step 3: Support — null out sent messages and assigned tickets first
    await prisma.supportMessage.updateMany({ where: { senderId: userId }, data: { senderId: null } });
    await prisma.supportTicket.updateMany({ where: { assignedToId: userId }, data: { assignedToId: null } });
    await prisma.supportTicket.deleteMany({ where: { customerId: userId } });

    // Step 4: Leads — null out references (nullable fields)
    await prisma.lead.updateMany({ where: { assignedToId: userId }, data: { assignedToId: null } });
    await prisma.leadActivity.updateMany({ where: { performedById: userId }, data: { performedById: null } });

    // Step 5: Internal notes, lead notes, and canned responses
    await prisma.internalNote.deleteMany({ where: { authorId: userId } });
    await prisma.leadNote.deleteMany({ where: { authorId: userId } });
    await prisma.cannedResponse.deleteMany({ where: { createdById: userId } });

    // Step 6: Orders (cascades to OrderItem, OrderNote, FormSubmission)
    await prisma.order.deleteMany({ where: { userId } });

    // Step 7: Documents and invoices
    await prisma.document.deleteMany({ where: { userId } });
    await prisma.invoice.deleteMany({ where: { userId } });

    // Step 8: Payment methods
    await prisma.paymentMethod.deleteMany({ where: { userId } });

    // Step 9: Activity log
    await prisma.activityLog.deleteMany({ where: { userId } });

    // Step 10: Delete the user (cascades Account, Session, UserSubscription)
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
