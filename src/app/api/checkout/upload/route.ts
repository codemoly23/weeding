import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getR2Config, uploadToR2 } from "@/lib/storage/r2";

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
];

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: images, PDF, Word, Excel, CSV, text." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try R2 first, fall back to local
    const r2Config = await getR2Config();

    if (r2Config) {
      const result = await uploadToR2(r2Config, buffer, file.name, file.type);

      if (result.success && result.url) {
        return NextResponse.json({
          url: result.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
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

    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${cleanName}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/checkout-uploads/${filename}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
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
