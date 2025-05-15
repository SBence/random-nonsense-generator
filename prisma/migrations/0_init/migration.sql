-- CreateTable
CREATE TABLE "Chat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "replyToMention" BOOLEAN NOT NULL DEFAULT true,
    "replyRandomly" BOOLEAN NOT NULL DEFAULT false,
    "adminOnlyCommands" BOOLEAN NOT NULL DEFAULT true,
    "adminOnlySettings" BOOLEAN NOT NULL DEFAULT true,
    "replyChance" INTEGER NOT NULL DEFAULT 0,
    "mentionReplyCount" INTEGER NOT NULL DEFAULT 0,
    "randomReplyCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL,
    "chatId" BIGINT NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("id", "chatId"),
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

