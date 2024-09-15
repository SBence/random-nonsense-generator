import { Menu } from "@grammyjs/menu";
import { menuButtonCallback, menuButtonText } from "./menuButtonHelpers.js";
import { ChatSettingToggleError } from "./ToggleFailedError.js";

export const settingsMenu = new Menu("settings", { autoAnswer: false })
  .text(
    async (ctx) => menuButtonText(ctx, "replyToMention", "Reply to mentions"),
    async (ctx) => {
      let replyToMention;
      try {
        replyToMention = await menuButtonCallback(ctx, "replyToMention");
      } catch (error) {
        if (error instanceof ChatSettingToggleError) return;
        else throw error;
      }
      await ctx.answerCallbackQuery(
        `✔️ ${replyToMention ? "Enabled" : "Disabled"} replying to mentions.`,
      );
    },
  )
  .text(
    async (ctx) => menuButtonText(ctx, "replyRandomly", "Reply randomly"),
    async (ctx) => {
      let replyRandomly;
      try {
        replyRandomly = await menuButtonCallback(ctx, "replyRandomly");
      } catch (error) {
        if (error instanceof ChatSettingToggleError) return;
        else throw error;
      }
      await ctx.answerCallbackQuery(
        `✔️ ${replyRandomly ? "Enabled" : "Disabled"} random replies.`,
      );
    },
  )
  .row()
  .text(
    async (ctx) =>
      menuButtonText(
        ctx,
        "adminOnlySettings",
        "Admin-only settings",
        "🔒",
        "🔓",
      ),
    async (ctx) => {
      let adminOnlySettings;
      try {
        adminOnlySettings = await menuButtonCallback(
          ctx,
          "adminOnlySettings",
          true,
        );
      } catch (error) {
        if (error instanceof ChatSettingToggleError) return;
        else throw error;
      }
      await ctx.answerCallbackQuery(
        `✔️ Settings can now be changed ${adminOnlySettings ? "only by admins" : "by everyone"}.`,
      );
    },
  )
  .row()
  .text(
    async (ctx) =>
      menuButtonText(
        ctx,
        "adminOnlyCommands",
        "Admin-only bot commands",
        "🔒",
        "🔓",
      ),
    async (ctx) => {
      let adminOnlyCommands;
      try {
        adminOnlyCommands = await menuButtonCallback(
          ctx,
          "adminOnlyCommands",
          true,
        );
      } catch (error) {
        if (error instanceof ChatSettingToggleError) return;
        else throw error;
      }
      await ctx.answerCallbackQuery(
        `✔️ Bot commands can now be used ${adminOnlyCommands ? "only by admins" : "by everyone"}.`,
      );
    },
  );
