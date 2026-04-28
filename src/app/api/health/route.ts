import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      db: "ok",
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: "unreachable",
        error: error instanceof Error ? error.message : "DB check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
