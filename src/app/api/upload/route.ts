import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getR2Config, uploadToR2 } from "@/lib/storage/r2";

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
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename — strip .., leading dots, keep only safe chars
    const timestamp = Date.now();
    const sanitizedName = (file.name
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^[._]+/, "") || "file");
    const filename = `${timestamp}-${sanitizedName}`;

    // Check if R2 is configured
    const r2Config = await getR2Config();

    if (r2Config) {
      // Upload to Cloudflare R2
      const result = await uploadToR2(
        r2Config,
        buffer,
        filename,
        file.type
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
