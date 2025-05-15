import { MIN_REQUIRED_MESSAGES, RANDOM_REPLY_START_CHANCE } from "@config";
import {
  database,
  getChatData,
  getChatMessageCount,
  incrementChatCounter,
  resetReplyChance,
  saveMessage,
} from "@database";
import { Context } from "grammy";
import checkBotMention from "./utils/checkBotMention.js";
import generateText from "./utils/generateText.js";

function shouldReplyRandomly(replyChance: number) {
  return !Math.floor(
    (Math.random() * (1 / RANDOM_REPLY_START_CHANCE)) / replyChance,
  );
}

export async function textMessageHandler(ctx: Context) {
  if (!ctx.message || !ctx.from || ctx.from.is_bot) return;
  if (ctx.chat?.type === "private") {
    void ctx.reply("This bot can only be used in groups.");
    return;
  }

  if (!checkBotMention(ctx)) await saveMessage(ctx.message);

  const chatId = ctx.message.chat.id;
  const [chatData, messageCount] = await database.$transaction([
    getChatData(chatId),
    getChatMessageCount(chatId),
  ]);
  const readyToGenerate = messageCount >= MIN_REQUIRED_MESSAGES;

  if (chatData.replyToMention && checkBotMention(ctx)) {
    if (readyToGenerate) {
      try {
        const generatedText = await generateText(chatId);
        void ctx.reply(generatedText);
        await Promise.all([
          resetReplyChance(chatId),
          incrementChatCounter(chatId, "mentionReplyCount"),
        ]);
      } catch {
        void ctx.reply("I'm at a loss for words. Literally.");
      }
    } else {
      await ctx.reply(
        `Apologies, I still need some more time...\nProgress: <b>${Math.floor((messageCount / MIN_REQUIRED_MESSAGES) * 100).toString()}%</b>`,
        { parse_mode: "HTML" },
      );
    }
  } else if (chatData.replyRandomly && readyToGenerate) {
    if (shouldReplyRandomly(chatData.replyChance)) {
      try {
        const generatedText = await generateText(chatId);
        void ctx.reply(generatedText);
        await Promise.all([
          resetReplyChance(chatId),
          incrementChatCounter(chatId, "randomReplyCount"),
        ]);
      } catch {
        // Can fail silently as a reply isn't guaranteed in this case, so the user doesn't expect one
      }
    } else {
      await incrementChatCounter(chatId, "replyChance");
    }
  }
}
