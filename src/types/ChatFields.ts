import { Chat } from "@prismaClient";

type FilterKeyTypes<T, F> = {
  [K in keyof T]: T[K] extends F ? K : never;
}[keyof T];

export type BooleanChatField = Pick<Chat, FilterKeyTypes<Chat, boolean>>;
export type NumberChatField = Pick<Chat, FilterKeyTypes<Chat, number>>;
