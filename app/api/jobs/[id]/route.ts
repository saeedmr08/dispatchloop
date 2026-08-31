import { NextResponse } from "next/server";

import { transition, type JobStatus } from "../../../../lib/dispatch";
import { listJobs, saveJobs } from "../../../../lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: JobStatus;
    technicianId?: string;
  };
  const jobs = listJobs();
  const current = jobs.find((job) => job.id === id);
  if (!current) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  try {
    const updated = transition(current, body.status, body.technicianId);
    saveJobs(jobs.map((job) => (job.id === id ? updated : job)));
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid transition" },
      { status: 409 },
    );
  }
}
