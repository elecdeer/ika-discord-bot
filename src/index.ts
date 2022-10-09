import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import cron from "node-cron";

import { cronJob } from "./cronJob";
import { env } from "./env";
import { createFetchSchedule } from "./schedule/fetchSchedule";
import { createScheduleStore } from "./schedule/scheduleStore";

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
export const client = await initializeClient();

export const scheduleStore = createScheduleStore(
  createFetchSchedule(env.fetchEndPoint, env.userAgent)
);

const setupCron = () => {
  const scheduleChangeHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
  cron.schedule(
    `0 0 ${scheduleChangeHours.join(",")} * * *`,
    async () => cronJob
  );
};

setupCron();

await cronJob();
