import { format } from "date-fns";
import { EmbedBuilder } from "discord.js";

import { client } from "./index";

import type { RuleSchedule } from "./schedule/schema";

export const sendScheduleMessage = async (
  channels: {
    channelId: string;
    full: boolean;
  }[],
  schedules: {
    regular: RuleSchedule;
    bankaraChallenge: RuleSchedule;
    bankaraOpen: RuleSchedule;
  }
) => {
  return Promise.all(
    channels.map(async ({ channelId, full }) => {
      const channel = await client.channels.fetch(channelId);
      if (channel === null) return;
      if (!channel.isTextBased()) return;

      if (full) {
        await channel.send({
          embeds: [createDigestScheduleEmbed(schedules)],
        });
      } else {
        await channel.send({
          embeds: [createDigestScheduleEmbed(schedules)],
        });
      }
    })
  );
};

const createFullScheduleEmbed = (schedules: {
  regular: RuleSchedule;
  bankaraChallenge: RuleSchedule;
  bankaraOpen: RuleSchedule;
}) => {
  const builder = new EmbedBuilder();
  return builder;
};

const createDigestScheduleEmbed = (schedules: {
  regular: RuleSchedule;
  bankaraChallenge: RuleSchedule;
  bankaraOpen: RuleSchedule;
}) => {
  const startDate = new Date(schedules.regular.start_time);
  const endDate = new Date(schedules.regular.end_time);
  const startStr = format(startDate, "yy/MM/dd HH:mm");
  const endStr = format(endDate, "yy/MM/dd HH:mm");

  const builder = new EmbedBuilder();
  builder.setTitle("現在のステージ情報");
  builder.setDescription(`${startStr} - ${endStr}`);
  builder.setColor(0xffff66);
  builder.addFields({
    name: schedules.regular.rule.name,
    value: schedules.regular.stages.map((stage) => stage.name).join(" / "),
  });
  builder.addFields({
    name: schedules.bankaraChallenge.rule.name,
    value: schedules.bankaraChallenge.stages
      .map((stage) => stage.name)
      .join(" / "),
  });
  builder.addFields({
    name: schedules.bankaraOpen.rule.name,
    value: schedules.bankaraOpen.stages.map((stage) => stage.name).join(" / "),
  });

  return builder.toJSON();
};
