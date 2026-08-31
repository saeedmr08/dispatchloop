import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type Job } from "./dispatch";

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");

const seed: Job[] = [
  {
    id: "WO-204",
    title: "Boiler lockout — Harbor Clinic",
    technicianId: null,
    status: "queued",
    slaMinutes: 180,
    elapsedMinutes: 20,
  },
  {
    id: "WO-198",
    title: "Lift inspection — North Pier",
    technicianId: "tech-maya",
    status: "assigned",
    slaMinutes: 240,
    elapsedMinutes: 90,
  },
  {
    id: "WO-191",
    title: "AHU belt — Atlas Mill",
    technicianId: "tech-jon",
    status: "in_progress",
    slaMinutes: 120,
    elapsedMinutes: 150,
  },
];

function readJobs(): Job[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as Job[];
  } catch {
    mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, `${JSON.stringify(seed, null, 2)}\n`);
    return seed;
  }
}

function writeJobs(jobs: Job[]): void {
  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, `${JSON.stringify(jobs, null, 2)}\n`);
}

export function listJobs(): Job[] {
  return readJobs();
}

export function saveJobs(jobs: Job[]): void {
  writeJobs(jobs);
}

export function createJob(title: string, slaMinutes = 180): Job {
  const jobs = readJobs();
  const job: Job = {
    id: `WO-${200 + jobs.length + 1}`,
    title,
    technicianId: null,
    status: "queued",
    slaMinutes,
    elapsedMinutes: 0,
  };
  jobs.unshift(job);
  writeJobs(jobs);
  return job;
}
