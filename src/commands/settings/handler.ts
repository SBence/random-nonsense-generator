import { getChatData } from "@database";
import { CommandContext, Context } from "grammy";
import { getMenuMessageText } from "./getMenuMessageText.js";
import isAdmin from "./isAdmin.js";
import { settingsMenu } from "./menu.js";

export async function settingsHandler(ctx: CommandContext<Context>) {
  if (!ctx.from || ctx.from.is_bot) return;

  if (ctx.chat.type === "private") {
    void ctx.reply("⚠️ This bot can only be used in groups.");
    return;
  }

  const [chatData, senderIsAdmin] = await Promise.all([
    getChatData(ctx.chat.id),
    isAdmin(ctx),
  ]);

  if (!senderIsAdmin && chatData.adminOnlySettings) {
    void ctx.reply("🚫 This command can only be used by admins.");
    return;
  }

  await ctx.reply(await getMenuMessageText(ctx.chat.id), {
    reply_markup: settingsMenu,
    parse_mode: "HTML",
  });
}
