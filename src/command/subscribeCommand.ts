import { SlashCommandBuilder } from "discord.js";

import { repository } from "../index";

import type { ChatInputCommandInteraction } from "discord.js";

export const handleSubscribeCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();

  const channelId = interaction.channelId;
  const full = interaction.options.getBoolean("full") ?? true;

  await repository.upsert(channelId, { full });

  await interaction.followUp({
    content: "このチャンネルへのスケジュール送信を登録しました",
  });
};

export const subscribeCommand = new SlashCommandBuilder()
  .setName("subscribe")
  .setDescription("このチャンネルへのスケジュール送信を登録する")
  .addBooleanOption((option) =>
    option
      .setName("full")
      .setDescription("ステージ画像込みのスケジュールを送信するか")
      .setRequired(false)
  );
