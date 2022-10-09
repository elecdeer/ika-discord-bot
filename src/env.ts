import * as dotenv from "dotenv";
import { z } from "zod";

const schema = z.object({
  discordToken: z.string().min(1),
  fetchEndPoint: z.string().min(1),
  userAgent: z.string().min(1),
});

const loadEnv = () => {
  dotenv.config();

  return schema.parse({
    discordToken: process.env.DISCORD_TOKEN,
    fetchEndPoint: process.env.FETCH_ENDPOINT,
    userAgent: process.env.USER_AGENT,
  });
};

export const env = loadEnv();
