import { updateActivity } from "./activity";
import { scheduleStore } from "./index";
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

  const channels = [
    {
      channelId: "1028612907375792188",
      full: true,
    },
  ];
  await sendScheduleMessage(channels, {
    regular: regularSchedule,
    bankaraChallenge: bankaraChallengeSchedule,
    bankaraOpen: bankaraOpenSchedule,
  });
};
