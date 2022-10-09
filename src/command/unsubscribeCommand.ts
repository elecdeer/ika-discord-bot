import { SlashCommandBuilder } from "discord.js";

import { repository } from "../index";

import type { ChatInputCommandInteraction } from "discord.js";

export const handleUnsubscribeCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();

  const channelId = interaction.channelId;

  await repository.delete(channelId);

  await interaction.followUp({
    content: "このチャンネルへのスケジュールを送信を停止しました",
  });
};

export const unsubscribeCommand = new SlashCommandBuilder()
  .setName("unsubscribe")
  .setDescription("このチャンネルへのスケジュールを送信を停止する");
