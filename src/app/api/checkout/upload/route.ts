import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getR2Config, uploadToR2 } from "@/lib/storage/r2";
import { assertPathInside, safeUploadFilename, validateUploadBuffer } from "@/lib/upload-validation";

// Allowed file types for checkout form uploads
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/checkout/upload — Upload file during checkout
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fieldName = formData.get("fieldName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const validation = validateUploadBuffer(buffer, file.type, ALLOWED_TYPES);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${safeUploadFilename(file.name)}`;

    // Try R2 first, fall back to local
    const r2Config = await getR2Config();

    if (r2Config) {
      const result = await uploadToR2(r2Config, buffer, filename, validation.mimeType);

      if (result.success && result.url) {
        return NextResponse.json({
          url: result.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: validation.mimeType,
          fieldName: fieldName || null,
          storage: "r2",
        });
      }
      console.warn("R2 upload failed, falling back to local:", result.error);
    }

    // Fall back to local storage
    const uploadsDir = path.join(process.cwd(), "public", "checkout-uploads");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    if (!assertPathInside(uploadsDir, filepath)) {
      return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
    }

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/checkout-uploads/${filename}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: validation.mimeType,
      fieldName: fieldName || null,
      storage: "local",
    });
  } catch (error) {
    console.error("Checkout upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
