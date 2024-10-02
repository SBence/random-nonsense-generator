import {
  CHAIN_STATE_SIZE,
  MAX_GENERATION_TRIES,
  MAX_MESSAGE_LENGTH,
  MIN_CHAIN_SCORE,
} from "@config";
import { getChatMessages } from "@database";
import MarkovChain, {
  MarkovGenerateOptions,
  MarkovResult,
} from "markov-strings";

const chainConfig: MarkovGenerateOptions = {
  maxTries: MAX_GENERATION_TRIES,
  filter: (result: MarkovResult) => {
    return (
      result.score >= MIN_CHAIN_SCORE &&
      !result.string.includes("@") &&
      result.string.length <= MAX_MESSAGE_LENGTH &&
      !result.string.includes("http")
    );
  },
};

export default async (chatId: number) => {
  const chain = new MarkovChain.default({ stateSize: CHAIN_STATE_SIZE });
  chain.addData((await getChatMessages(chatId)).map((message) => message.text));
  return chain.generate(chainConfig).string;
};
