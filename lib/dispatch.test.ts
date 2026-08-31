import { describe, expect, it } from "vitest";

import { isBreached, transition, type Job } from "./dispatch";

const job = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  title: "Replace rooftop condenser",
  technicianId: null,
  status: "queued",
  slaMinutes: 240,
  elapsedMinutes: 0,
  ...overrides,
});

describe("dispatch transitions", () => {
  it("assigns then starts a job", () => {
    const assigned = transition(job(), "assigned", "tech-maya");
    const started = transition(assigned, "in_progress", "tech-maya");
    expect(started.status).toBe("in_progress");
    expect(started.technicianId).toBe("tech-maya");
  });

  it("rejects skipping from queued to done", () => {
    expect(() => transition(job(), "done")).toThrow(/Cannot move/);
  });

  it("flags an SLA breach on an open job", () => {
    expect(isBreached(job({ elapsedMinutes: 300 }))).toBe(true);
    expect(isBreached(job({ status: "done", elapsedMinutes: 300 }))).toBe(false);
  });
});
