import { getChatData } from "@database";
import { CommandContext, Context } from "grammy";
import isAdmin from "../settings/isAdmin.js";

export async function statsHandler(ctx: CommandContext<Context>) {
  if (!ctx.from || ctx.from.is_bot) return;

  if (ctx.chat.type === "private") {
    void ctx.reply("This bot can only be used in groups.");
    return;
  }

  const [chatData, senderIsAdmin] = await Promise.all([
    getChatData(ctx.chat.id),
    isAdmin(ctx),
  ]);

  if (chatData.adminOnlyCommands && !senderIsAdmin) return;

  await ctx.reply(
    `📊 <b>Stats</b>\nReplies to mentions: <b>${chatData.mentionReplyCount.toString()}</b>\nRandom replies: <b>${chatData.randomReplyCount.toString()}</b>\nTotal: <b>${(chatData.mentionReplyCount + chatData.randomReplyCount).toString()}</b>`,
    {
      parse_mode: "HTML",
    },
  );
}
