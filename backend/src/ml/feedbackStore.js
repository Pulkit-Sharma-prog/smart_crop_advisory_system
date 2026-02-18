import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { backendEnv } from "../env.js";

async function appendJsonLine(targetPath, payload) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.appendFile(targetPath, `${JSON.stringify(payload)}\n`, "utf8");
}

export async function storeDiseaseFeedback(input) {
  const feedbackId = crypto.randomUUID();
  const event = {
    feedbackId,
    receivedAt: new Date().toISOString(),
    ...input,
  };

  await appendJsonLine(backendEnv.feedbackPath, event);

  if (input.correctedLabel && input.predictedLabel && input.correctedLabel !== input.predictedLabel) {
    await appendJsonLine(backendEnv.retrainingQueuePath, {
      type: "label_correction",
      ...event,
    });
  }

  return {
    feedbackId,
    queuedForRetraining: Boolean(input.correctedLabel && input.predictedLabel && input.correctedLabel !== input.predictedLabel),
  };
}
