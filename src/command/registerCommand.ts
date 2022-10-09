import { client } from "../index";
import { subscribeCommand } from "./subscribeCommand";
import { unsubscribeCommand } from "./unsubscribeCommand";

export const registerCommand = async () => {
  await client.application.commands.create(subscribeCommand);
  await client.application.commands.create(unsubscribeCommand);
};
