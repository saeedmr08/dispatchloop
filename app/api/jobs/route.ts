import { NextResponse } from "next/server";

import { TECHNICIANS } from "../../../lib/dispatch";
import { createJob, listJobs } from "../../../lib/store";

export async function GET() {
  return NextResponse.json({ data: listJobs(), technicians: TECHNICIANS });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    slaMinutes?: number;
  };
  if (!body.title || body.title.trim().length < 8) {
    return NextResponse.json(
      { error: "title must be at least 8 characters" },
      { status: 400 },
    );
  }
  const sla =
    typeof body.slaMinutes === "number" && body.slaMinutes >= 30
      ? body.slaMinutes
      : 180;
  return NextResponse.json({ data: createJob(body.title.trim(), sla) }, { status: 201 });
}
