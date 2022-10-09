import fetch from "node-fetch";

import { scheduleAPISchema } from "./schema";

import type { ScheduleAPIRes } from "./schema";

export type FetchSchedule = () => Promise<ScheduleAPIRes>;

export const createFetchSchedule =
  (endpoint: string, userAgent: string): FetchSchedule =>
  async () => {
    console.log(`try fetch to ${endpoint}`);
    const res = await fetch(endpoint, {
      headers: {
        "User-Agent": userAgent,
      },
    });
    const json = await res.json();
    return await scheduleAPISchema.parseAsync(json);
  };
