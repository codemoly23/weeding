import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getR2Config, uploadToR2 } from "@/lib/storage/r2";
import { assertPathInside, safeUploadFilename, validateUploadBuffer } from "@/lib/upload-validation";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images and SVG)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ] as const;

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const validation = validateUploadBuffer(buffer, file.type, validTypes);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Sanitize filename — strip .., leading dots, keep only safe chars
    const timestamp = Date.now();
    const sanitizedName = safeUploadFilename(file.name);
    const filename = `${timestamp}-${sanitizedName}`;

    // Check if R2 is configured
    const r2Config = await getR2Config();

    if (r2Config) {
      // Upload to Cloudflare R2
      const result = await uploadToR2(
        r2Config,
        buffer,
        filename,
        validation.mimeType
      );

      if (result.success && result.url) {
        return NextResponse.json({ url: result.url, storage: "r2" });
      } else {
        // Fall back to local storage on R2 error
        console.warn("R2 upload failed, falling back to local:", result.error);
      }
    }

    // Whitelist allowed upload folders — prevents path traversal via folder param
    const ALLOWED_FOLDERS = new Set(["uploads", "avatars", "covers", "blog", "vendors", "services", "venues"]);
    const uploadFolder = folder && ALLOWED_FOLDERS.has(folder) ? folder : "uploads";
    const uploadsDir = path.join(process.cwd(), "public", uploadFolder);

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    if (!assertPathInside(uploadsDir, filepath)) {
      return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
    }

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/${uploadFolder}/${filename}`;
    return NextResponse.json({ url, storage: "local" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
