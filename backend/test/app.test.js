import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

const testStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), "smart-crop-backend-test-"));
process.env.DISEASE_FEEDBACK_PATH = path.join(testStorageDir, "feedback.jsonl");
process.env.DISEASE_RETRAINING_QUEUE_PATH = path.join(testStorageDir, "retraining_queue.jsonl");
process.env.DISEASE_TRAINING_JOBS_PATH = path.join(testStorageDir, "jobs.json");

const { createApp } = await import("../src/app.js");
const app = createApp();

afterAll(() => {
  fs.rmSync(testStorageDir, { recursive: true, force: true });
});

describe("backend adapter", () => {
  it("serves health endpoint", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns soil recommendation", async () => {
    const response = await request(app).post("/api/recommendations/soil").send({
      nitrogen: 120,
      phosphorus: 60,
      potassium: 40,
      ph: 6.5,
      landSize: 5,
    });

    expect(response.status).toBe(200);
    expect(response.body.healthScore).toBeTypeOf("number");
    expect(response.body.crops.length).toBeGreaterThan(0);
  });

  it("rejects invalid soil recommendation payload", async () => {
    const response = await request(app).post("/api/recommendations/soil").send({
      nitrogen: -1,
      phosphorus: 60,
      potassium: 40,
      ph: 6.5,
      landSize: 5,
    });

    expect(response.status).toBe(400);
  });

  it("analyzes disease image and returns guidance payload", async () => {
    const response = await request(app)
      .post("/api/disease/analyze")
      .attach("file", Buffer.from("fake-image-content"), {
        filename: "tomato_leaf.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(200);
    expect(response.body.primary.name).toBeTypeOf("string");
    expect(response.body.guidance.preventiveMeasures.length).toBeGreaterThan(0);
    expect(response.body.guidance.curativeActions.length).toBeGreaterThan(0);
  });

  it("rejects empty google auth payload", async () => {
    const response = await request(app).post("/api/auth/google/verify").send({});
    expect(response.status).toBe(400);
  });

  it("returns disease model registry", async () => {
    const response = await request(app).get("/api/disease/ml/checkpoints");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.versions)).toBe(true);
  });

  it("accepts disease feedback payload", async () => {
    const response = await request(app).post("/api/disease/feedback").send({
      diagnosisId: "diag-1",
      predictedLabel: "Early Blight",
      correctedLabel: "Late Blight",
      confidence: 72,
      notes: "Field verification mismatch",
      language: "en",
    });

    expect(response.status).toBe(202);
    expect(response.body.feedbackId).toBeTypeOf("string");
  });

  it("creates and fetches disease training job", async () => {
    const createResponse = await request(app).post("/api/disease/train/jobs").send({
      requestedBy: "integration-test",
      priority: "normal",
      targetVersionId: "canary-v2",
      notes: "scaffold queue test",
    });

    expect(createResponse.status).toBe(202);
    expect(createResponse.body.jobId).toBeTypeOf("string");
    expect(createResponse.body.status).toBe("queued");

    const getResponse = await request(app).get(`/api/disease/train/jobs/${createResponse.body.jobId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.jobId).toBe(createResponse.body.jobId);
  });

  it("patches training job status and heartbeat", async () => {
    const createResponse = await request(app).post("/api/disease/train/jobs").send({
      requestedBy: "integration-test",
      priority: "high",
      targetVersionId: "canary-v3",
    });
    expect(createResponse.status).toBe(202);

    const startResponse = await request(app)
      .patch(`/api/disease/train/jobs/${createResponse.body.jobId}`)
      .send({
        status: "running",
        workerId: "worker-1",
        message: "Worker picked the training job",
      });
    expect(startResponse.status).toBe(200);
    expect(startResponse.body.status).toBe("running");
    expect(startResponse.body.workerId).toBe("worker-1");

    const heartbeatResponse = await request(app)
      .patch(`/api/disease/train/jobs/${createResponse.body.jobId}`)
      .send({
        heartbeat: true,
        progress: 42,
        message: "epoch 4/10 completed",
      });
    expect(heartbeatResponse.status).toBe(200);
    expect(heartbeatResponse.body.lastHeartbeatAt).toBeTypeOf("string");
    expect(heartbeatResponse.body.progress).toBe(42);

    const completeResponse = await request(app)
      .patch(`/api/disease/train/jobs/${createResponse.body.jobId}`)
      .send({
        status: "completed",
        checkpointVersionId: "canary-v3",
        metrics: { top1: 0.84, macroF1: 0.8 },
      });
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe("completed");
    expect(completeResponse.body.checkpointVersionId).toBe("canary-v3");
    expect(completeResponse.body.progress).toBe(100);
  });

  it("demo worker tick auto-runs queued training jobs", async () => {
    const createResponse = await request(app).post("/api/disease/train/jobs").send({
      requestedBy: "tick-test",
      priority: "normal",
      targetVersionId: "canary-v4",
    });
    expect(createResponse.status).toBe(202);

    const tick1 = await request(app).post("/api/disease/train/workers/tick").send({
      workerId: "demo-worker-A",
      progressStep: 60,
    });
    expect(tick1.status).toBe(200);
    expect(tick1.body.startedJobId).toBeTypeOf("string");
    expect(Array.isArray(tick1.body.heartbeatJobIds)).toBe(true);

    const tick2 = await request(app).post("/api/disease/train/workers/tick").send({
      workerId: "demo-worker-A",
      progressStep: 60,
    });
    expect(tick2.status).toBe(200);
    expect(Array.isArray(tick2.body.completedJobIds)).toBe(true);
    expect(tick2.body.completedJobIds.length).toBeGreaterThanOrEqual(1);
  });
});

