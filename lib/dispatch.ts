export type JobStatus = "queued" | "assigned" | "in_progress" | "blocked" | "done";

export interface Job {
  id: string;
  title: string;
  technicianId: string | null;
  status: JobStatus;
  slaMinutes: number;
  elapsedMinutes: number;
}

export const TECHNICIANS = [
  { id: "tech-maya", name: "Maya Chen" },
  { id: "tech-jon", name: "Jon Bell" },
  { id: "tech-nadia", name: "Nadia Okafor" },
] as const;

const allowed: Record<JobStatus, JobStatus[]> = {
  queued: ["assigned"],
  assigned: ["in_progress", "queued"],
  in_progress: ["blocked", "done"],
  blocked: ["in_progress"],
  done: [],
};

export function transition(job: Job, next: JobStatus, technicianId?: string): Job {
  if (!allowed[job.status].includes(next)) {
    throw new Error(`Cannot move ${job.status} → ${next}`);
  }
  if (next === "assigned" || next === "in_progress") {
    if (!technicianId) {
      throw new Error("A technician must own an assigned job");
    }
  }
  return {
    ...job,
    status: next,
    technicianId: next === "queued" ? null : technicianId ?? job.technicianId,
  };
}

export function slaRemaining(job: Job): number {
  if (job.status === "blocked" || job.status === "done") {
    return job.slaMinutes - job.elapsedMinutes;
  }
  return job.slaMinutes - job.elapsedMinutes;
}

export function isBreached(job: Job): boolean {
  return slaRemaining(job) < 0 && job.status !== "done";
}
