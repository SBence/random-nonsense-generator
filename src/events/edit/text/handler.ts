import { updateMessage } from "@database";
import { Context } from "grammy";

export async function textEditHandler(context: Context) {
  if (!context.editedMessage) return;
  await updateMessage(context.editedMessage);
}
