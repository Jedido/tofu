/* eslint-disable */
// AUTO-GENERATED from shared/specs/anagramSpec.ts — do not edit.
// Run `npm run generate -- anagram` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const SettingsData = z.object({
  gameMode: z.string(),
  showAnswer: z.boolean(),
  oneshot: z.boolean(),
  strikes: z.union([z.number(), z.string()]),
  ciphers: z.union([z.number(), z.string()]),
  cipherTime: z.union([z.number(), z.string()]),
  timerType: z.string(),
  scoreLimit: z.union([z.number(), z.string()]),
  timeLimit: z.union([z.number(), z.string()]),
});

export type SettingsData = z.infer<typeof SettingsData>;

const SubmitData = z.string();

export type SubmitData = z.infer<typeof SubmitData>;

const PlayerData = z.object({
  id: z.string(),
  ign: z.string(),
});

export type PlayerData = z.infer<typeof PlayerData>;

const PlayerResultData = z.object({
  ign: z.string(),
  score: z.number(),
  submissions: z.array(z.string()),
});

export type PlayerResultData = z.infer<typeof PlayerResultData>;

const StartData = z.object({
  players: z.array(PlayerData),
  settings: SettingsData,
});

export type StartData = z.infer<typeof StartData>;

const ResultData = z.object({
  answer: z.string().nullable(),
  timeout: z.boolean(),
});

export type ResultData = z.infer<typeof ResultData>;

const UpdatePlayerData = z.object({
  playerId: z.string(),
  score: z.number(),
  strikes: z.number(),
});

export type UpdatePlayerData = z.infer<typeof UpdatePlayerData>;

const CipherData = z.object({
  scrambled: z.string(),
  time: z.number(),
});

export type CipherData = z.infer<typeof CipherData>;

const EndData = z.object({
  results: z.record(z.string(), PlayerResultData),
  ciphers: z.array(z.tuple([z.string(), z.string()])),
});

export type EndData = z.infer<typeof EndData>;

export abstract class AnagramServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "anagram-init": this.initAction(this.parseDataAs(SettingsData, data), socket); break
      case "anagram-submit": this.submitAction(this.parseDataAs(SubmitData, data), socket); break
    }
  }

  abstract initAction(data: SettingsData, sender: TSocket): void;

  abstract submitAction(data: SubmitData, sender: TSocket): void;

  sendStart(data: StartData, recipient?: TSocket): void {
    this.send("anagram-start", data, recipient)
  }

  sendResult(data: ResultData, recipient?: TSocket): void {
    this.send("anagram-result", data, recipient)
  }

  sendUpdatePlayer(data: UpdatePlayerData, recipient?: TSocket): void {
    this.send("anagram-update-player", data, recipient)
  }

  sendCipher(data: CipherData, recipient?: TSocket): void {
    this.send("anagram-cipher", data, recipient)
  }

  sendEnd(data: EndData, recipient?: TSocket): void {
    this.send("anagram-end", data, recipient)
  }
}
AnagramServiceBase.prototype.id = "anagram"
