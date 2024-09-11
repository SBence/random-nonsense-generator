import {
  getChatData,
  toggleAdminOnlyCommands,
  toggleAdminOnlySettings,
  toggleReplyRandomly,
  toggleReplyToMention,
} from "@database";
import { Menu } from "@grammyjs/menu";
import { getMenuMessageText } from "./getMenuMessageText.js";
import isAdmin from "./isAdmin.js";

export const settingsMenu = new Menu("settings", { autoAnswer: false })
  .text(
    async (ctx) => {
      if (!ctx.chat) return "Reply to mentions";
      const replyToMention = (await getChatData(ctx.chat.id)).replyToMention;
      return `${replyToMention ? "🟢" : "🔴"} Reply to mentions`;
    },
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId)
        return await ctx.answerCallbackQuery("❌ Failed to toggle setting.");

      const [chatData, senderIsAdmin] = await Promise.all([
        getChatData(chatId),
        isAdmin(ctx),
      ]);

      if (
        (chatData.adminOnlySettings || chatData.adminOnlyCommands) &&
        !senderIsAdmin
      )
        return ctx.answerCallbackQuery(
          "🚫 This option can only be changed by administrators.",
        );

      await toggleReplyToMention(chatId);
      await ctx.editMessageText(await getMenuMessageText(chatId), {
        parse_mode: "HTML",
      });

      const replyToMention = (await getChatData(chatId)).replyToMention;
      await ctx.answerCallbackQuery(
        `✔️ ${replyToMention ? "Enabled" : "Disabled"} replying to mentions.`,
      );
    },
  )
  .text(
    async (ctx) => {
      if (!ctx.chat) return "Reply randomly";
      const replyRandomly = (await getChatData(ctx.chat.id)).replyRandomly;
      return `${replyRandomly ? "🟢" : "🔴"} Reply randomly`;
    },
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId)
        return await ctx.answerCallbackQuery("❌ Failed to toggle setting.");

      const [chatData, senderIsAdmin] = await Promise.all([
        getChatData(chatId),
        isAdmin(ctx),
      ]);

      if (
        (chatData.adminOnlySettings || chatData.adminOnlyCommands) &&
        !senderIsAdmin
      )
        return ctx.answerCallbackQuery(
          "🚫 This option can only be changed by administrators.",
        );

      await toggleReplyRandomly(chatId);
      await ctx.editMessageText(await getMenuMessageText(chatId), {
        parse_mode: "HTML",
      });

      const replyRandomly = (await getChatData(chatId)).replyRandomly;
      await ctx.answerCallbackQuery(
        `✔️ ${replyRandomly ? "Enabled" : "Disabled"} random replies.`,
      );
    },
  )
  .row()
  .text(
    async (ctx) => {
      if (!ctx.chat) return "Admin-only settings";
      const adminOnlySettings = (await getChatData(ctx.chat.id))
        .adminOnlySettings;
      return `${adminOnlySettings ? "🔒" : "🔓"} Admin-only settings`;
    },
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId)
        return await ctx.answerCallbackQuery("❌ Failed to toggle setting.");

      if (!(await isAdmin(ctx)))
        return ctx.answerCallbackQuery(
          "🚫 This option can only be changed by administrators.",
        );

      await toggleAdminOnlySettings(chatId);
      await ctx.editMessageText(await getMenuMessageText(chatId), {
        parse_mode: "HTML",
      });

      const adminOnlySettings = (await getChatData(chatId)).adminOnlySettings;
      await ctx.answerCallbackQuery(
        `✔️ Settings can now be changed ${adminOnlySettings ? "only by admins" : "by everyone"}.`,
      );
    },
  )
  .row()
  .text(
    async (ctx) => {
      if (!ctx.chat) return "Admin-only bot commands";
      const adminOnlyCommands = (await getChatData(ctx.chat.id))
        .adminOnlyCommands;
      return `${adminOnlyCommands ? "🔒" : "🔓"} Admin-only bot commands`;
    },
    async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId)
        return await ctx.answerCallbackQuery("❌ Failed to toggle setting.");

      if (!(await isAdmin(ctx)))
        return ctx.answerCallbackQuery(
          "🚫 This option can only be changed by administrators.",
        );

      await toggleAdminOnlyCommands(chatId);
      await ctx.editMessageText(await getMenuMessageText(chatId), {
        parse_mode: "HTML",
      });

      const adminOnlyCommands = (await getChatData(chatId)).adminOnlyCommands;
      await ctx.answerCallbackQuery(
        `✔️ Bot commands can now be used ${adminOnlyCommands ? "only by admins" : "by everyone"}.`,
      );
    },
  );
