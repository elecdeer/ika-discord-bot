import { z } from "zod";

export type ScheduleAPIRes = z.infer<typeof scheduleAPISchema>;
export type Stage = z.infer<typeof stageSchema>;
export type RuleSchedule = z.infer<typeof ruleScheduleSchema>;

const preprocessDate = (dateStr: unknown) => {
  if (typeof dateStr === "string") {
    return new Date(dateStr);
  }
};

export const ruleSchema = z.object({
  key: z.union([
    z.literal("TURF_WAR"),
    z.literal("AREA"),
    z.literal("LOFT"),
    z.literal("GOAL"),
    z.literal("CLAM"),
  ]),
  name: z.string(),
});

export const stageSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
});

export const ruleScheduleSchema = z.object({
  start_time: z.preprocess(preprocessDate, z.date()),
  end_time: z.preprocess(preprocessDate, z.date()),
  rule: ruleSchema,
  stages: z.array(stageSchema),
  is_fest: z.boolean(),
});

export const scheduleAPISchema = z.object({
  result: z.object({
    regular: z.array(ruleScheduleSchema),
    bankara_challenge: z.array(ruleScheduleSchema),
    bankara_open: z.array(ruleScheduleSchema),
  }),
  //TODO フェス対応
});
