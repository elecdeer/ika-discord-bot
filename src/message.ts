import { format } from "date-fns";
import { APIEmbed, AttachmentBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import sharp from "sharp";

import { client } from "./index";

import type { RuleSchedule } from "./schedule/schema";
import type { MessageCreateOptions } from "discord.js";

const embedColor = 0xffff66;

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
  const fullPayload = await createFullSchedulePayload(schedules);
  const digestPayload = await createDigestSchedulePayload(schedules);

  return Promise.all(
    channels.map(async ({ channelId, full }) => {
      const channel = await client.channels.fetch(channelId);
      if (channel === null) return;
      if (!channel.isTextBased()) return;

      if (full) {
        await channel.send(fullPayload);
      } else {
        await channel.send(digestPayload);
      }
    })
  );
};

const createFullSchedulePayload = async (schedules: {
  regular: RuleSchedule;
  bankaraChallenge: RuleSchedule;
  bankaraOpen: RuleSchedule;
}): Promise<MessageCreateOptions> => {
  const startDate = new Date(schedules.regular.start_time);
  const endDate = new Date(schedules.regular.end_time);
  const startStr = format(startDate, "yy/MM/dd HH:mm");
  const endStr = format(endDate, "yy/MM/dd HH:mm");

  const headingEmbed = new EmbedBuilder()
    .setTitle("現在のステージ情報")
    .setColor(embedColor)
    .setDescription(`${startStr} - ${endStr}`);

  const createScheduleEmbed = async (
    scheduleName: string,
    schedule: RuleSchedule
  ) => {
    const image = await createConcatStageImage(schedule.stages);

    const fileName = `stage-${schedule.rule.key}.png`;

    const file = new AttachmentBuilder(image, {
      name: fileName,
    });

    const builder = new EmbedBuilder()
      .setTitle(`${scheduleName} - ${schedule.rule.name}`)
      .setDescription(schedule.stages.map((stage) => stage.name).join(" / "))
      .setColor(embedColor)
      .setImage(`attachment://${fileName}`);

    return {
      embed: builder,
      file: file,
    };
  };

  const embedWithFileList = await Promise.all([
    createScheduleEmbed("レギュラーマッチ", schedules.regular),
    createScheduleEmbed(
      "バンカラマッチ（チャレンジ）",
      schedules.bankaraChallenge
    ),
    createScheduleEmbed("バンカラマッチ（オープン）", schedules.bankaraOpen),
  ]);

  return {
    embeds: [headingEmbed, ...embedWithFileList.map((e) => e.embed)],
    files: embedWithFileList.map((e) => e.file),
  };
};

const createConcatStageImage = async (stages: RuleSchedule["stages"]) => {
  const stageUrlA = stages[0].image;
  const stageUrlB = stages[1].image;

  const stageImageA = await fetch(stageUrlA);
  const stageImageB = await fetch(stageUrlB);

  const sharpA = await sharp(new Uint8Array(await stageImageA.arrayBuffer()));
  const sharpB = await sharp(new Uint8Array(await stageImageB.arrayBuffer()));

  const metadataA = await sharpA.metadata();
  const metadataB = await sharpB.metadata();

  const height = Math.max(metadataA.height ?? 0, metadataB.height ?? 0);
  const width = (metadataA.width ?? 0) + (metadataB.width ?? 0);

  const composited = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  }).composite([
    {
      input: await sharpA.toBuffer(),
      gravity: "northwest",
      left: 0,
      top: 0,
    },
    {
      input: await sharpB.toBuffer(),
      gravity: "northwest",
      left: metadataA.width ?? 0,
      top: 0,
    },
  ]);

  // await composited.toFile(`./${stages[0].name}-${stages[1].name}.png`);

  return await composited.toFormat("png").withMetadata().toBuffer();
};

const createDigestSchedulePayload = async (schedules: {
  regular: RuleSchedule;
  bankaraChallenge: RuleSchedule;
  bankaraOpen: RuleSchedule;
}): Promise<MessageCreateOptions> => {
  const startDate = new Date(schedules.regular.start_time);
  const endDate = new Date(schedules.regular.end_time);
  const startStr = format(startDate, "yy/MM/dd HH:mm");
  const endStr = format(endDate, "yy/MM/dd HH:mm");

  const builder = new EmbedBuilder();
  builder.setTitle("現在のステージ情報");
  builder.setDescription(`${startStr} - ${endStr}`);
  builder.setColor(embedColor);
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

  return {
    embeds: [builder.toJSON()],
  };
};
