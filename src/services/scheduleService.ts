import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { apiRequest } from "./httpClient";
import { mockSchedule } from "./mockData";

export interface ScheduleTask {
  task: string;
  reason: string;
}

export interface SchedulePhase {
  phase: string;
  date: string;
  status: "upcoming" | "pending" | "completed";
  color: "leaf" | "sky" | "earth" | "forest";
  tasks: ScheduleTask[];
}

const scheduleTaskSchema = z.object({
  task: z.string(),
  reason: z.string(),
});

const schedulePhaseSchema = z.object({
  phase: z.string(),
  date: z.string(),
  status: z.enum(["upcoming", "pending", "completed"]),
  color: z.enum(["leaf", "sky", "earth", "forest"]),
  tasks: z.array(scheduleTaskSchema),
});

const scheduleSchema = z.array(schedulePhaseSchema);

export interface ScheduleQueryInput {
  crop?: string;
  language?: string;
}

function toQuery(input?: ScheduleQueryInput) {
  if (!input) return "";
  const params = new URLSearchParams();
  if (input.crop) params.set("crop", input.crop);
  if (input.language) params.set("language", input.language);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getSchedulePhases(input?: ScheduleQueryInput): Promise<SchedulePhase[]> {
  if (appEnv.useMockData) {
    return mockSchedule;
  }

  try {
    const response = await apiRequest<unknown>(`/api/schedule${toQuery(input)}`);
    return scheduleSchema.parse(response);
  } catch (error) {
    if (appEnv.allowApiFallback) {
      logger.warn("Schedule API failed. Falling back to mock data.", error);
      return mockSchedule;
    }

    throw error;
  }
}
