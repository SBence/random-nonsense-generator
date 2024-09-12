export class ChatSettingToggleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatSettingToggleError";
  }
}
