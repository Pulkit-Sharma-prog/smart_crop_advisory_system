import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { backendEnv } from "../env.js";

const DEFAULT_STORE = {
  schemaVersion: "1.0",
  updatedAt: new Date(0).toISOString(),
  jobs: [],
};

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

function assertTransitionAllowed(current, next) {
  const allowed = {
    queued: new Set(["running", "cancelled", "failed"]),
    running: new Set(["running", "completed", "failed", "cancelled"]),
    completed: new Set([]),
    failed: new Set([]),
    cancelled: new Set([]),
  };

  if (!allowed[current]?.has(next)) {
    throw new Error(`Invalid status transition: ${current} -> ${next}`);
  }
}

async function ensureStoreFile() {
  const targetPath = backendEnv.trainingJobsPath;
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  try {
    await fs.access(targetPath);
  } catch {
    await fs.writeFile(targetPath, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
  return targetPath;
}

async function readStore() {
  const targetPath = await ensureStoreFile();
  const raw = await fs.readFile(targetPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.jobs)) parsed.jobs = [];
  return parsed;
}

async function writeStore(store) {
  const targetPath = await ensureStoreFile();
  const next = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(targetPath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function createTrainingJob(payload = {}) {
  const store = await readStore();
  const now = new Date().toISOString();
  const job = {
    jobId: crypto.randomUUID(),
    status: "queued",
    createdAt: now,
    updatedAt: now,
    requestedBy: payload.requestedBy ?? "api",
    priority: payload.priority ?? "normal",
    trainerConfigPath: payload.trainerConfigPath ?? path.join(backendEnv.backendRoot, "ml", "trainer.config.json"),
    datasetManifestPath: payload.datasetManifestPath ?? backendEnv.datasetManifestPath,
    targetVersionId: payload.targetVersionId ?? null,
    notes: payload.notes ?? "",
    scheduleAt: payload.scheduleAt ?? null,
    events: [
      {
        at: now,
        type: "queued",
        message: "Training job queued.",
      },
    ],
  };

  store.jobs.unshift(job);
  await writeStore(store);
  return job;
}

export async function listTrainingJobs(limit = 50) {
  const store = await readStore();
  return store.jobs.slice(0, Math.max(1, Math.min(200, limit)));
}

export async function getTrainingJobById(jobId) {
  const store = await readStore();
  return store.jobs.find((item) => item.jobId === jobId) ?? null;
}

export async function patchTrainingJob(jobId, payload = {}) {
  const store = await readStore();
  const job = store.jobs.find((item) => item.jobId === jobId);
  if (!job) return null;

  const now = new Date().toISOString();
  const nextStatus = payload.status ?? job.status;

  if (payload.status && payload.status !== job.status) {
    assertTransitionAllowed(job.status, payload.status);
  }

  if (payload.heartbeat && TERMINAL_STATUSES.has(job.status)) {
    throw new Error(`Cannot heartbeat terminal job with status '${job.status}'`);
  }

  if (payload.status) {
    job.status = payload.status;
    if (payload.status === "running" && !job.startedAt) {
      job.startedAt = now;
      job.attempt = (job.attempt ?? 0) + 1;
    }
    if (TERMINAL_STATUSES.has(payload.status)) {
      job.finishedAt = now;
      if (payload.status === "completed") {
        job.progress = 100;
      }
    }
  }

  if (typeof payload.progress === "number") {
    job.progress = Math.max(0, Math.min(100, Math.round(payload.progress)));
  } else if (payload.heartbeat && nextStatus === "running") {
    const currentProgress = Number.isFinite(Number(job.progress)) ? Number(job.progress) : 0;
    job.progress = Math.max(0, Math.min(99, Math.round(currentProgress + 3)));
  }

  if (payload.workerId) {
    job.workerId = payload.workerId;
  }

  if (payload.metrics) {
    job.metrics = {
      ...(job.metrics ?? {}),
      ...payload.metrics,
    };
  }

  if (payload.checkpointVersionId) {
    job.checkpointVersionId = payload.checkpointVersionId;
  }

  if (payload.heartbeat) {
    job.lastHeartbeatAt = now;
  }

  job.updatedAt = now;
  const eventType = payload.heartbeat ? "heartbeat" : (payload.status ?? "update");
  job.events = Array.isArray(job.events) ? job.events : [];
  job.events.push({
    at: now,
    type: eventType,
    message: payload.message ?? `Job updated: ${eventType}`,
  });

  await writeStore(store);
  return job;
}

export async function tickTrainingWorker(options = {}) {
  const store = await readStore();
  const now = new Date().toISOString();
  const workerId = options.workerId ?? "demo-worker-1";
  const progressStep = Math.max(1, Math.min(100, Math.round(options.progressStep ?? 40)));
  const processAllRunning = options.processAllRunning !== false;

  let startedJobId = null;

  let runningJobs = store.jobs.filter((item) => item.status === "running");
  if (runningJobs.length === 0) {
    const queuedJobs = store.jobs
      .filter((item) => item.status === "queued")
      .filter((item) => !item.scheduleAt || new Date(item.scheduleAt).getTime() <= Date.now())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const nextQueued = queuedJobs[0] ?? null;
    if (nextQueued) {
      nextQueued.status = "running";
      nextQueued.startedAt = nextQueued.startedAt ?? now;
      nextQueued.updatedAt = now;
      nextQueued.workerId = workerId;
      nextQueued.lastHeartbeatAt = now;
      nextQueued.progress = Number.isFinite(Number(nextQueued.progress)) ? Number(nextQueued.progress) : 0;
      nextQueued.attempt = (nextQueued.attempt ?? 0) + 1;
      nextQueued.events = Array.isArray(nextQueued.events) ? nextQueued.events : [];
      nextQueued.events.push({
        at: now,
        type: "running",
        message: "Worker picked up queued training job.",
      });
      startedJobId = nextQueued.jobId;
      runningJobs = [nextQueued];
    }
  }

  const jobsToProcess = processAllRunning ? runningJobs : runningJobs.slice(0, 1);
  const completedJobIds = [];
  const heartbeatJobIds = [];

  jobsToProcess.forEach((job) => {
    if (TERMINAL_STATUSES.has(job.status)) return;
    const previous = Number.isFinite(Number(job.progress)) ? Number(job.progress) : 0;
    const next = Math.min(100, Math.max(0, Math.round(previous + progressStep)));
    job.progress = next;
    job.workerId = workerId;
    job.lastHeartbeatAt = now;
    job.updatedAt = now;
    job.events = Array.isArray(job.events) ? job.events : [];
    job.events.push({
      at: now,
      type: "heartbeat",
      message: `Worker heartbeat. Progress ${next}%`,
    });
    heartbeatJobIds.push(job.jobId);

    if (next >= 100) {
      job.status = "completed";
      job.finishedAt = now;
      job.checkpointVersionId = job.checkpointVersionId ?? job.targetVersionId ?? null;
      job.events.push({
        at: now,
        type: "completed",
        message: "Training job auto-completed by demo worker tick.",
      });
      completedJobIds.push(job.jobId);
    }
  });

  await writeStore(store);

  return {
    workerId,
    startedJobId,
    heartbeatJobIds,
    completedJobIds,
    queueDepth: store.jobs.filter((item) => item.status === "queued").length,
    runningDepth: store.jobs.filter((item) => item.status === "running").length,
    completedDepth: store.jobs.filter((item) => item.status === "completed").length,
    tickedAt: now,
  };
}
