import { MIN_REQUIRED_MESSAGES, RANDOM_REPLY_START_CHANCE } from "@config";
import {
  getChatData,
  getChatMessageCount,
  incrementChatCounter,
  resetReplyChance,
  saveMessage,
} from "@database";
import { Context } from "grammy";
import checkBotMention from "./checkBotMention.js";
import generateText from "./generateText.js";

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
  const [chatData, chatMessageCount] = await Promise.all([
    getChatData(chatId),
    getChatMessageCount(chatId),
  ]);
  const readyToGenerate = chatMessageCount >= MIN_REQUIRED_MESSAGES;

  if (chatData.replyToMention && checkBotMention(ctx)) {
    if (readyToGenerate) {
      try {
        const generatedText = await generateText(chatId);
        void ctx.reply(generatedText);
        await Promise.all([
          incrementChatCounter(chatId, "mentionReplyCount"),
          resetReplyChance(chatId),
        ]);
      } catch {
        void ctx.reply("I'm at a loss for words. Literally.");
      }
    } else {
      await ctx.reply(
        `Apologies, I still need some more time...\nProgress: <b>${Math.floor((chatMessageCount / MIN_REQUIRED_MESSAGES) * 100).toString()}%</b>`,
        { parse_mode: "HTML" },
      );
    }
  } else if (chatData.replyRandomly && readyToGenerate) {
    if (shouldReplyRandomly(chatData.replyChance)) {
      try {
        const generatedText = await generateText(chatId);
        void ctx.reply(generatedText);
        await Promise.all([
          incrementChatCounter(chatId, "randomReplyCount"),
          resetReplyChance(chatId),
        ]);
      } catch {
        // Can fail silently as a reply isn't guaranteed in this case, so the user doesn't expect one.
      }
    } else {
      await incrementChatCounter(chatId, "replyChance");
    }
  }
}
