import { BotError, GrammyError, HttpError } from "grammy";

export default (err: BotError) => {
  const ctx = err.ctx;
  console.error(
    `❌🔄 Error while handling update: ${ctx.update.update_id.toString()}:`,
  );
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("❌💬 Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("❌🔗 Could not contact Telegram:", e);
  } else {
    console.error("❌❔ Unknown error:", e);
  }
};
