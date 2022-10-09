import { updateActivity } from "./activity";
import { repository, scheduleStore } from "./index";
import { sendScheduleMessage } from "./message";

export const cronJob = async () => {
  console.log("Cron job is running");

  const date = new Date();
  const regularSchedule = await scheduleStore.getRegular(date);
  const bankaraChallengeSchedule = await scheduleStore.getBankaraChallenge(
    date
  );
  const bankaraOpenSchedule = await scheduleStore.getBankaraOpen(date);

  updateActivity(bankaraChallengeSchedule, bankaraOpenSchedule);

  const channelEntries = await repository.getAll();
  const channels = channelEntries.map(([channelId, option]) => ({
    channelId: channelId,
    full: option.full,
  }));

  await sendScheduleMessage(channels, {
    regular: regularSchedule,
    bankaraChallenge: bankaraChallengeSchedule,
    bankaraOpen: bankaraOpenSchedule,
  });
};
