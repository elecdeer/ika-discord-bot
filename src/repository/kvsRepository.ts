import { kvsEnvStorage } from "@kvs/env";

import type { Repository } from "./repository";

type RepositoryItem = {
  full: boolean;
};

export const createKvsRepository = async (): Promise<Repository> => {
  const storage = await kvsEnvStorage<Record<string, RepositoryItem>>({
    name: "ika-schedule-channels",
    version: 1,
    storeFilePath: "./store.json",
  });

  return {
    upsert: async (channelId: string, full: boolean) => {
      await storage.set(channelId, { full });
    },
    delete: async (channelId: string) => {
      await storage.delete(channelId);
    },
  };
};
