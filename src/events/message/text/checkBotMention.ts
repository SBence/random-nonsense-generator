import { Context } from "grammy";

export default (context: Context) => {
  if (!context.message) return false;
  const message = context.message;
  if (!(message.text && message.entities)) return false;

  for (const entity of message.entities) {
    if (entity.type !== "mention") continue;
    const substring = message.text.substring(
      entity.offset + 1,
      entity.offset + entity.length,
    );
    if (substring === context.me.username) return true;
  }

  return false;
};
