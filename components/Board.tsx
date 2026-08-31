"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  isBreached,
  slaRemaining,
  TECHNICIANS,
  type Job,
  type JobStatus,
} from "../lib/dispatch";

export function Board() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState("Replace condenser — West Clinic");
  const [slaMinutes, setSlaMinutes] = useState(180);
  const [message, setMessage] = useState("Loading board from disk…");

  async function refresh() {
    const response = await fetch("/api/jobs");
    const body = (await response.json()) as { data: Job[] };
    setJobs(body.data);
    const breached = body.data.filter((job) => isBreached(job)).length;
    setMessage(
      `${body.data.length} work orders on disk${breached ? ` · ${breached} SLA risk` : ""}`,
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function move(id: string, status: JobStatus) {
    const job = jobs.find((item) => item.id === id);
    if (!job) return;
    const response = await fetch(`/api/jobs/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        technicianId: job.technicianId ?? "tech-maya",
      }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Transition rejected");
      return;
    }
    await refresh();
  }

  async function addJob(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, slaMinutes }),
    });
    if (!response.ok) {
      setMessage("Title must be at least 8 characters");
      return;
    }
    setTitle("");
    await refresh();
  }

  const lanes: JobStatus[] = ["queued", "assigned", "in_progress", "blocked", "done"];

  return (
    <main className="wrap">
      <p className="eyebrow">Field operations</p>
      <h1>DispatchLoop</h1>
      <p>{message}</p>
      <form onSubmit={(event) => void addJob(event)}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New work order"
          aria-label="New work order title"
        />
        <input
          type="number"
          min={30}
          value={slaMinutes}
          onChange={(event) => setSlaMinutes(Number(event.target.value))}
          aria-label="SLA minutes"
          style={{ width: 88 }}
        />
        <button type="submit">Create job</button>
      </form>
      <p className="crew">
        Crew: {TECHNICIANS.map((tech) => tech.name).join(" · ")}
      </p>
      <div className="lanes five">
        {lanes.map((lane) => (
          <section key={lane}>
            <h2>{lane.replace("_", " ")}</h2>
            {jobs.filter((job) => job.status === lane).length === 0 ? (
              <p className="empty">Empty</p>
            ) : null}
            {jobs
              .filter((job) => job.status === lane)
              .map((job) => (
                <article key={job.id} className={isBreached(job) ? "card risk" : "card"}>
                  <strong>{job.id}</strong>
                  <p>{job.title}</p>
                  <p>
                    {job.technicianId ?? "unassigned"} · SLA {slaRemaining(job)}m
                  </p>
                  {lane !== "done" ? (
                    <button type="button" onClick={() => void move(job.id, nextStatus(lane))}>
                      Advance
                    </button>
                  ) : null}
                  {lane === "in_progress" ? (
                    <button type="button" onClick={() => void move(job.id, "blocked")}>
                      Block
                    </button>
                  ) : null}
                </article>
              ))}
          </section>
        ))}
      </div>
    </main>
  );
}

function nextStatus(lane: JobStatus): JobStatus {
  if (lane === "queued") return "assigned";
  if (lane === "assigned") return "in_progress";
  if (lane === "in_progress") return "done";
  if (lane === "blocked") return "in_progress";
  return "done";
}
