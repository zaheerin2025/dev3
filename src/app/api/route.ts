import { NextResponse } from "next/server";

/** Health check endpoint — used by monitoring and deployment readiness probes. */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}