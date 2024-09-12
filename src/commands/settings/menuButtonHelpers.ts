import { getChatData } from "@database";
import { Chat } from "@prisma/client";
import { Context } from "grammy";
import { ChatSettingToggleError } from "./ToggleFailedError.js";
import { getMenuMessageText } from "./getMenuMessageText.js";
import isAdmin from "./isAdmin.js";

type BooleanFields<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

type BooleanChatFields = Pick<Chat, BooleanFields<Chat>>;

async function isChatSettingsAdminOnly(chatId: number) {
  const chatData = await getChatData(chatId);
  return chatData.adminOnlySettings || chatData.adminOnlyCommands;
}

export async function menuButtonText(
  ctx: Context,
  settingKey: keyof BooleanChatFields,
  settingName: string,
  enabledEmoji = "🟢",
  disabledEmoji = "🔴",
) {
  if (!ctx.chat) return settingName;
  const settingState = (await getChatData(ctx.chat.id))[settingKey];
  return `${settingState ? enabledEmoji : disabledEmoji} ${settingName}`;
}

export async function menuButtonCallback(
  ctx: Context,
  settingKey: keyof BooleanChatFields,
  toggleFunction: (chatId: number) => Promise<void>,
  forceAdminOnly = false,
) {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    await ctx.answerCallbackQuery("❌ Failed to toggle setting.");
    throw new ChatSettingToggleError("Chat ID not found");
  }

  if (
    !(await isAdmin(ctx)) &&
    (forceAdminOnly || (await isChatSettingsAdminOnly(chatId)))
  ) {
    await ctx.answerCallbackQuery(
      "🚫 This option can only be changed by administrators.",
    );
    throw new ChatSettingToggleError("User is not admin");
  }

  await toggleFunction(chatId);
  await ctx.editMessageText(await getMenuMessageText(chatId), {
    parse_mode: "HTML",
  });

  return (await getChatData(chatId))[settingKey];
}
