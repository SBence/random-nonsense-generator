import { MIN_REQUIRED_MESSAGES } from "@config";
import { getChatMessageCount } from "@database";

export async function getMenuMessageText(chatId: number) {
  const chatMessageCount = await getChatMessageCount(chatId);
  const readyToGenerate = chatMessageCount >= MIN_REQUIRED_MESSAGES;

  let returnString = `⚙️ <b>Settings</b>\nUse the buttons below to adjust settings.\n\nℹ️ To delete chat history stored by the bot, remove it from the group.`;
  const progressText = `\n\n<i>Preparation progress: <b>${Math.floor((chatMessageCount / MIN_REQUIRED_MESSAGES) * 100).toString()}%</b>\nBelow options will only work once completed.</i>`;

  if (!readyToGenerate) returnString += progressText;
  return returnString;
}
