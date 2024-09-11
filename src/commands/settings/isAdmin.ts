import { Context } from "grammy";
import { ChatMember } from "grammy/types";

const isAdminMap: Record<ChatMember["status"], boolean> = {
  administrator: true,
  creator: true,
  kicked: false,
  left: false,
  member: false,
  restricted: false,
};

export default async (ctx: Context) => {
  if (!ctx.from) return false;
  return isAdminMap[(await ctx.getChatMember(ctx.from.id)).status];
};
