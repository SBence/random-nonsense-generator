import { BooleanChatField } from "@customTypes/ChatFields.js";
import { getChatData, toggleChatSetting } from "@database";
import { Context } from "grammy";
import { ChatSettingToggleError } from "./ToggleFailedError.js";
import { getMenuMessageText } from "./getMenuMessageText.js";
import isAdmin from "./isAdmin.js";

async function isChatSettingsAdminOnly(chatId: number) {
  const chatData = await getChatData(chatId);
  return chatData.adminOnlySettings || chatData.adminOnlyCommands;
}

export async function menuButtonText(
  ctx: Context,
  settingKey: keyof BooleanChatField,
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
  settingKey: keyof BooleanChatField,
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

  await toggleChatSetting(chatId, settingKey);
  await ctx.editMessageText(await getMenuMessageText(chatId), {
    parse_mode: "HTML",
  });

  return (await getChatData(chatId))[settingKey];
}
