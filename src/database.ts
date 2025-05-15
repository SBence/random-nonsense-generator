import { BooleanChatField, NumberChatField } from "@customTypes/ChatFields.js";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { Prisma, PrismaClient } from "@prismaClient";
import { Message } from "grammy/types";
import { dirname, join } from "path";
import packageJson from "../package.json" with { type: "json" };
import { MAX_MESSAGES_PER_CHAT } from "./config.js";

if (!process.env.DATABASE_URL)
  throw new Error("❌ DATABASE_URL not set in .env file");

const prismaFolder = dirname(packageJson.prisma.schema);
const relativeDatabaseFilePath = process.env.DATABASE_URL.replace(/file:/, "");
const databaseFilePath = join(prismaFolder, relativeDatabaseFilePath);

const adapter = new PrismaBetterSQLite3({
  url: `file:${databaseFilePath}`,
});
export const database = new PrismaClient({ adapter });

export function getChats(
  onlyId?: boolean,
  tx: Prisma.TransactionClient = database,
) {
  return tx.chat.findMany({ select: { id: onlyId ? true : Prisma.skip } });
}

export function getChatData(
  chatId: number,
  tx: Prisma.TransactionClient = database,
) {
  // Using upsert here ensures the chat exists in the database without relying on the join event, which can be missed
  return tx.chat.upsert({
    where: { id: chatId },
    create: { id: chatId },
    update: {},
  });
}

export function deleteChat(
  chatId: number,
  tx: Prisma.TransactionClient = database,
) {
  console.log(`💬🔴 Left chat: ${chatId.toString()}`);
  return tx.chat.delete({ where: { id: chatId } });
}

export function resetReplyChance(
  chatId: number,
  tx: Prisma.TransactionClient = database,
) {
  return tx.chat.upsert({
    where: { id: chatId },
    create: { id: chatId, replyChance: 0 },
    update: { replyChance: 0 },
  });
}

async function _trimMessagesToLimit(
  chatId: number | bigint,
  newMessage: boolean,
  tx: Prisma.TransactionClient,
) {
  const messageCount = await getChatMessageCount(chatId, tx);
  const overflowCount = messageCount + +newMessage - MAX_MESSAGES_PER_CHAT;
  if (overflowCount <= 0) return;

  const oldestMessages = await tx.message.findMany({
    where: { chatId },
    orderBy: { id: "asc" },
    take: overflowCount,
    select: { id: true },
  });

  return tx.message.deleteMany({
    where: {
      AND: [{ chatId }, { id: { in: oldestMessages.map((m) => m.id) } }],
    },
  });
}

export function trimMessagesToLimit(
  chatId: number | bigint,
  newMessage: boolean,
  tx?: Prisma.TransactionClient,
) {
  if (tx) {
    return _trimMessagesToLimit(chatId, newMessage, tx);
  } else {
    return database.$transaction(async (tx) => {
      return _trimMessagesToLimit(chatId, newMessage, tx);
    });
  }
}

async function _saveMessage(message: Message, tx: Prisma.TransactionClient) {
  if (!message.text) return;

  await _trimMessagesToLimit(message.chat.id, true, tx);
  await getChatData(message.chat.id, tx); // Ensure chat exists

  return tx.message.create({
    data: {
      text: message.text,
      chatId: message.chat.id,
      id: message.message_id,
    },
  });
}

export function saveMessage(message: Message, tx?: Prisma.TransactionClient) {
  if (tx) {
    return _saveMessage(message, tx);
  } else {
    return database.$transaction(async (tx) => {
      return _saveMessage(message, tx);
    });
  }
}

async function _upsertMessage(
  message: Message,
  trim: boolean,
  tx: Prisma.TransactionClient,
) {
  if (!message.text) return;

  if (trim) await _trimMessagesToLimit(message.chat.id, true, tx);
  await getChatData(message.chat.id, tx); // Ensure chat exists

  return tx.message.upsert({
    where: { id_chatId: { id: message.message_id, chatId: message.chat.id } },
    create: {
      id: message.message_id,
      chatId: message.chat.id,
      text: message.text,
    },
    update: {
      text: message.text,
    },
  });
}

export function upsertMessage(
  message: Message,
  trim = true,
  tx?: Prisma.TransactionClient,
) {
  if (tx) {
    return _upsertMessage(message, trim, tx);
  } else {
    return database.$transaction(async (tx) => {
      return _upsertMessage(message, trim, tx);
    });
  }
}

export function getChatMessages(
  chatId: number,
  tx: Prisma.TransactionClient = database,
) {
  return tx.message.findMany({ where: { chatId } });
}

export function getChatMessageCount(
  chatId: number | bigint,
  tx: Prisma.TransactionClient = database,
) {
  return tx.message.count({ where: { chatId } });
}

async function _toggleChatSetting(
  chatId: number,
  setting: keyof BooleanChatField,
  tx: Prisma.TransactionClient,
) {
  const chatData = await getChatData(chatId, tx);
  return tx.chat.update({
    where: { id: chatId },
    data: { [setting]: !chatData[setting] },
  });
}

export function toggleChatSetting(
  chatId: number,
  setting: keyof BooleanChatField,
  tx?: Prisma.TransactionClient,
) {
  if (tx) {
    return _toggleChatSetting(chatId, setting, tx);
  } else {
    return database.$transaction(async (tx) => {
      return _toggleChatSetting(chatId, setting, tx);
    });
  }
}

export function incrementChatCounter(
  chatId: number,
  counter: keyof NumberChatField,
  tx: Prisma.TransactionClient = database,
) {
  return tx.chat.upsert({
    where: { id: chatId },
    create: { id: chatId, [counter]: 1 },
    update: { [counter]: { increment: 1 } },
  });
}

async function _cleanup(tx: Prisma.TransactionClient) {
  const chatIds = (await getChats(true, tx)).map((chat) => chat.id);
  for (const chatId of chatIds) {
    await _trimMessagesToLimit(chatId, false, tx);
  }
}

export async function cleanup(tx?: Prisma.TransactionClient) {
  console.log("🧹⏳ Cleaning up database...");
  if (tx) {
    await _cleanup(tx);
  } else {
    await database.$transaction(async (tx) => {
      await _cleanup(tx);
    });
  }
  console.log("🧹✅ Cleanup complete!");
}
