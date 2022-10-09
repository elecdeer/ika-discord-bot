export interface Repository {
  upsert: (channelId: string, full: boolean) => Promise<void>;
  delete: (channelId: string) => Promise<void>;
}
