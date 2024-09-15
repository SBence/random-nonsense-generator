import { MAX_MESSAGES_PER_CHAT } from "@config";
import { BooleanChatField, NumberChatField } from "@customTypes/ChatFields.js";
import { PrismaClient } from "@prisma/client";
import { Message } from "grammy/types";

const database = new PrismaClient();

export function getChats(idOnly: boolean) {
  return database.chat.findMany({ select: { id: idOnly ? true : undefined } });
}

export function getChatData(chatId: number) {
  return database.chat.upsert({
    where: { id: chatId },
    create: { id: chatId },
    update: {},
  });
}

export async function newChat(chatId: number) {
  await database.chat.create({ data: { id: chatId } });
  console.log(`💬🟢 Added chat: ${chatId.toString()}`);
}

export async function deleteChat(chatId: number) {
  await database.chat.delete({ where: { id: chatId } });
  console.log(`💬🔴 Removed chat: ${chatId.toString()}`);
}

export async function resetReplyChance(chatId: number) {
  await database.chat.upsert({
    where: { id: chatId },
    create: { id: chatId, replyChance: 0 },
    update: { replyChance: 0 },
  });
}

export async function trimMessagesToLimit(
  chatId: number | bigint,
  newMessage: boolean,
) {
  const messageCount = await getChatMessageCount(chatId);
  const overflowCount =
    messageCount + (newMessage ? 1 : 0) - MAX_MESSAGES_PER_CHAT;
  const lowestId = (
    await database.message.findFirst({
      where: { chatId },
      orderBy: { id: "asc" },
    })
  )?.id;
  if (!lowestId) return;
  await database.message.deleteMany({
    where: { chatId, id: { lt: lowestId + overflowCount } },
  });
}

export async function saveMessage(message: Message) {
  if (!message.text) return;

  await trimMessagesToLimit(message.chat.id, true);

  await getChatData(message.chat.id);
  await database.message.create({
    data: {
      text: message.text,
      chatId: message.chat.id,
      id: message.message_id,
    },
  });
}

export async function updateMessage(message: Message) {
  if (!message.text) return;
  await getChatData(message.chat.id);
  await database.message.update({
    where: { id_chatId: { id: message.message_id, chatId: message.chat.id } },
    data: {
      text: message.text,
    },
  });
}

export function getChatMessages(chatId: number) {
  return database.message.findMany({ where: { chatId } });
}

export function getChatMessageCount(chatId: number | bigint) {
  return database.message.count({ where: { chatId } });
}

export async function toggleChatSetting(
  chatId: number,
  setting: keyof BooleanChatField,
) {
  const chatData = await getChatData(chatId);
  await database.chat.update({
    where: { id: chatId },
    data: { [setting]: !chatData[setting] },
  });
}

export async function incrementChatCounter(
  chatId: number,
  counter: keyof NumberChatField,
) {
  await database.chat.upsert({
    where: { id: chatId },
    create: { id: chatId, [counter]: 1 },
    update: { [counter]: { increment: 1 } },
  });
}
