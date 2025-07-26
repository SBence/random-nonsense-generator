import { cleanup, deleteChat } from "@database";
import "dotenv/config";
import { Bot, GrammyError } from "grammy";
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
    const chatId = ctx.chat.id;

    if (isChatMemberMap[ctx.myChatMember.new_chat_member.status]) {
      // Not adding the chat to the database here, as database operations create it if it doesn't exist
      console.log(`💬🟢 New chat: ${chatId.toString()}`);
    } else {
      await deleteChat(chatId);
    }
  });

  await cleanup();

  try {
    await bot.init();
    console.log(
      `🟢 Running as: ${bot.botInfo.first_name} (@${bot.botInfo.username})`,
    );
  } catch (error) {
    if (error instanceof GrammyError && error.error_code === 401) {
      throw new Error("❌ Invalid token set in .env file");
    }
    throw error;
  }

  void bot.start();
}

const token = process.env.TOKEN;
if (token) {
  void bootstrap(token);
} else {
  throw new Error("❌ Token not set in .env file");
}
