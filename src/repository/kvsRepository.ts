import { kvsEnvStorage } from "@kvs/env";

import type { SubscribeOption, Repository } from "./repository";

export const createKvsRepository = async (): Promise<Repository> => {
  const storage = await kvsEnvStorage<Record<string, SubscribeOption>>({
    name: "ika-schedule-channels",
    version: 1,
    storeFilePath: "./store",
  });

  return {
    upsert: async (channelId, option) => {
      await storage.set(channelId, option);
    },
    delete: async (channelId: string) => {
      await storage.delete(channelId);
    },
    getAll: async () => {
      const entries = [];
      for await (const entry of storage) {
        entries.push(entry);
      }
      return entries;
    },
  };
};
