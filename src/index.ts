import { deleteChat, getChats, newChat, trimMessagesToLimit } from "@database";
import "dotenv/config";
import { Bot } from "grammy";
import { ChatMember } from "grammy/types";
import { settingsHandler } from "./commands/settings/handler.js";
import { settingsMenu } from "./commands/settings/menu.js";
import { statsHandler } from "./commands/stats/handler.js";
import errorHandler from "./errorHandler.js";
import { textEditHandler } from "./events/edit/text/handler.js";
import { textMessageHandler } from "./events/message/text/handler.js";

const isChatMemberMap: Record<ChatMember["status"], boolean> = {
  administrator: true,
  creator: true,
  kicked: false,
  left: false,
  member: true,
  restricted: true,
};

async function cleanup() {
  console.log("🧹⏳ Cleaning up database...");
  const chatIds = (await getChats(true)).map((chat) => chat.id);
  for (const chatId of chatIds) {
    await trimMessagesToLimit(chatId, false);
  }
  console.log("🧹✅ Cleanup complete!");
}

async function bootstrap(token: string) {
  const bot = new Bot(token);

  bot.catch(errorHandler);

  bot.use(settingsMenu);

  bot.command("start", (ctx) =>
    ctx.reply("Hello! Add me to a group to get started!"),
  );
  bot.command("settings", settingsHandler);
  bot.command("stats", statsHandler);

  bot.on("message:text", textMessageHandler);
  bot.on("edit:text", textEditHandler);
  bot.on("my_chat_member", async (ctx) => {
    if (isChatMemberMap[ctx.myChatMember.new_chat_member.status]) {
      await newChat(ctx.chat.id);
    } else {
      await deleteChat(ctx.chat.id);
    }
  });

  await cleanup();
  await bot.init();
  console.log(
    `🟢 Running as: ${bot.botInfo.first_name} (@${bot.botInfo.username})`,
  );
  void bot.start();
}

const token = process.env.TOKEN;
if (token) {
  void bootstrap(token);
} else {
  console.error("Token not found in .env file");
}
