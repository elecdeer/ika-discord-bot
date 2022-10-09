import { ActivityType } from "discord.js";

import { client } from "./index";

import type { RuleSchedule } from "./schedule/schema";

export const updateActivity = (
  challengeRuleSchedule: RuleSchedule,
  openRuleSchedule: RuleSchedule
) => {
  const getRuleName = (ruleSchedule: RuleSchedule) => {
    return ruleSchedule.rule.name.replace("バトル", "");
  };

  const activityName = `C${getRuleName(challengeRuleSchedule)} / O${getRuleName(
    openRuleSchedule
  )}`;

  client.user.setActivity(activityName, {
    type: ActivityType.Playing,
  });
};
