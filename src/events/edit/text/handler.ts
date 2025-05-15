import { upsertMessage } from "@database";
import { Context } from "grammy";

export async function textEditHandler(context: Context) {
  if (!context.editedMessage) return;
  await upsertMessage(context.editedMessage, false); // Using upsertMessage in case the initial message was not saved
}
