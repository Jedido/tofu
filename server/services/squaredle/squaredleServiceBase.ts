/* eslint-disable */
// AUTO-GENERATED from server/specs/squaredleSpec.ts — do not edit.
// Run `npm run generate -- squaredle --force` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const BoardCellData = z.object({
  letter: z.string(),
  instances: z.number(),
  starts: z.number(),
});

export type BoardCellData = z.infer<typeof BoardCellData>;

const BoardData = z.object({
  board: z.array(z.array(BoardCellData)),
  foundWords: z.array(z.string()),
  allWords: z.record(z.string(), z.array(z.array(z.number()))),
});

export type BoardData = z.infer<typeof BoardData>;

const InitData = z.object({ size: z.number() });

export type InitData = z.infer<typeof InitData>;

const SubmitData = z.string();

export type SubmitData = z.infer<typeof SubmitData>;

const GetData = z.unknown();

export type GetData = z.infer<typeof GetData>;

const RevealWordData = z.string();

export type RevealWordData = z.infer<typeof RevealWordData>;

const BonusWordData = z.string();

export type BonusWordData = z.infer<typeof BonusWordData>;

const GuessResponseData = z.object({
  word: z.string(),
  result: z.string(),
});

export type GuessResponseData = z.infer<typeof GuessResponseData>;

export abstract class SquaredleServiceBase extends GameService {
  constructor(roomId: string) {
    super(roomId)
    this.actions["squaredle-init"] = (data, socket) => this.initAction(this.parseDataAs(InitData, data), socket)
    this.actions["squaredle-submit"] = (data, socket) => this.submitAction(this.parseDataAs(SubmitData, data), socket)
    this.actions["squaredle-get"] = (data, socket) => this.getAction(this.parseDataAs(GetData, data), socket)
  }

  abstract initAction(data: InitData, sender: TSocket): void;

  abstract submitAction(data: SubmitData, sender: TSocket): void;

  abstract getAction(data: GetData, sender: TSocket): void;

  sendBoard(data: BoardData, recipient?: TSocket): void {
    this.send("squaredle-board", data, recipient)
  }

  sendRevealWord(data: RevealWordData, recipient?: TSocket): void {
    this.send("squaredle-reveal-word", data, recipient)
  }

  sendBonusWord(data: BonusWordData, recipient?: TSocket): void {
    this.send("squaredle-bonus-word", data, recipient)
  }

  sendGuessResponse(data: GuessResponseData, recipient?: TSocket): void {
    this.send("squaredle-guess-response", data, recipient)
  }
}
SquaredleServiceBase.prototype.id = "squaredle"
