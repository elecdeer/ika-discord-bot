export type SubscribeOption = {
  full: boolean;
};

export interface Repository {
  upsert: (channelId: string, option: SubscribeOption) => Promise<void>;
  getAll: () => Promise<[string, SubscribeOption][]>;
  delete: (channelId: string) => Promise<void>;
}
