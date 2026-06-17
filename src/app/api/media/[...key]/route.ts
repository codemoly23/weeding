import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Config, createR2Client } from "@/lib/storage/r2";

// Simple in-memory config cache (1 minute TTL) to avoid DB hit on every image request
let _cache: { config: Awaited<ReturnType<typeof getR2Config>>; at: number } | null = null;

async function getCachedConfig() {
  const now = Date.now();
  if (_cache && now - _cache.at < 60_000) return _cache.config;
  const config = await getR2Config();
  _cache = { config, at: now };
  return config;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/"); // e.g. "uploads/1234567890-photo.jpg"

  if (!objectKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  const r2Config = await getCachedConfig();
  if (!r2Config) {
    return new NextResponse("Storage not configured", { status: 503 });
  }

  try {
    const client = createR2Client(r2Config);
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return new NextResponse("Not found", { status: 404 });
    }

    const bytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Content-Length": String(buffer.byteLength),
        // Cache aggressively — filenames contain timestamps so they never collide
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
