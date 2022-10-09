import { format } from "date-fns";
import {
  ActivityType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
} from "discord.js";
import cron from "node-cron";

import { env } from "./env";
import { createFetchSchedule } from "./schedule/fetchSchedule";
import { createScheduleStore } from "./schedule/scheduleStore";

import type { RuleSchedule } from "./schedule/schema";
import type { TextBasedChannel } from "discord.js";

const initializeClient = () =>
  new Promise<Client<true>>((resolve, reject) => {
    const client = new Client({
      intents: [],
    });

    client.on("ready", () => {
      if (client.isReady()) {
        console.log("Client is ready");
        resolve(client);
      }
    });

    void client.login(env.discordToken);
  });
const client = await initializeClient();

const scheduleStore = createScheduleStore(
  createFetchSchedule(env.fetchEndPoint, env.userAgent)
);

const updateActivity = (challengeRuleName: string, openRuleName: string) => {
  const minifyRuleName = (ruleName: string) => {
    return ruleName.replace("バトル", "");
  };

  const activityName = `C${minifyRuleName(
    challengeRuleName
  )} / O${minifyRuleName(openRuleName)}`;
  client.user.setActivity(activityName, {
    type: ActivityType.Playing,
  });
};

const sendScheduleMessage = async (
  channel: TextBasedChannel,
  schedules: {
    regular: RuleSchedule;
    bankaraChallenge: RuleSchedule;
    bankaraOpen: RuleSchedule;
  }
) => {
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

  await channel.send({ embeds: [builder] });
};

const setupCron = () => {
  const scheduleChangeHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
  cron.schedule(
    `0 0 ${scheduleChangeHours.join(",")} * * *`,
    async () => cronJob
  );
};

setupCron();

const cronJob = async () => {
  console.log("Cron job is running");

  const date = new Date();
  const regularSchedule = await scheduleStore.getRegular(date);
  const bankaraChallengeSchedule = await scheduleStore.getBankaraChallenge(
    date
  );
  const bankaraOpenSchedule = await scheduleStore.getBankaraOpen(date);

  updateActivity(
    bankaraChallengeSchedule.rule.name,
    bankaraOpenSchedule.rule.name
  );

  const channel = await client.channels.fetch("1028612907375792188");
  if (channel === null) {
    console.warn("Channel is not found");
    return;
  }

  if (!channel.isTextBased()) {
    console.warn("Channel is not text based");
    return;
  }

  await sendScheduleMessage(channel, {
    regular: regularSchedule,
    bankaraChallenge: bankaraChallengeSchedule,
    bankaraOpen: bankaraOpenSchedule,
  });
};

await cronJob();
