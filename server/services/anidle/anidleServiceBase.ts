/* eslint-disable */
// AUTO-GENERATED from server/specs/anidleSpec.ts — do not edit.
// Run `npm run generate -- anidle --force` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const GuessData = z.object({
  mal_id: z.number(),
  title: z.string(),
});

export type GuessData = z.infer<typeof GuessData>;

const NoData = z.unknown();

export type NoData = z.infer<typeof NoData>;

const QueryData = z.string();

export type QueryData = z.infer<typeof QueryData>;

const StartData = z
  .object({
    maxPopularity: z.number(),
    themeType: z.union([z.literal("ALL"), z.literal("OP"), z.literal("ED")]),
  })
  .nullish();

export type StartData = z.infer<typeof StartData>;

const LoadingData = z.null();

export type LoadingData = z.infer<typeof LoadingData>;

const RevealedData = z.object({
  source: z.string(),
  correctGenres: z.array(z.string()),
  incorrectGenres: z.array(z.string()),
  popularityMin: z.number().optional(),
  popularityMax: z.number().optional(),
  rankMin: z.number().optional(),
  rankMax: z.number().optional(),
  scoreMin: z.number().optional(),
  scoreMax: z.number().optional(),
  airedStartMin: z.unknown().optional(),
  airedStartMax: z.unknown().optional(),
  airedEndMin: z.unknown().optional(),
  airedEndMax: z.unknown().optional(),
});

export type RevealedData = z.infer<typeof RevealedData>;

const GuessInfoData = z.object({
  mal_id: z.number(),
  title: z.string(),
  user: z.string(),
  correct: z.boolean().optional(),
  image_url: z.string().optional(),
});

export type GuessInfoData = z.infer<typeof GuessInfoData>;

const InitGameData = z.object({
  synopsis: z.string(),
  audioClue: z.unknown(),
  revealedData: RevealedData,
});

export type InitGameData = z.infer<typeof InitGameData>;

const GuessResultEventData = z.object({
  revealedData: RevealedData,
  guess: GuessInfoData,
  revealIndices: z.array(z.number()),
});

export type GuessResultEventData = z.infer<typeof GuessResultEventData>;

const RepeatGuessData = z.object({ name: z.number() });

export type RepeatGuessData = z.infer<typeof RepeatGuessData>;

const AutocompleteResultData = z.object({
  options: z.array(z.unknown()),
  query: z.string(),
});

export type AutocompleteResultData = z.infer<typeof AutocompleteResultData>;

const WinData = z.object({ title: z.string() });

export type WinData = z.infer<typeof WinData>;

export abstract class AnidleServiceBase extends GameService {
  constructor(roomId: string) {
    super(roomId)
    this.actions["anidle-start"] = (data, socket) => this.startAction(this.parseDataAs(StartData, data), socket)
    this.actions["anidle-guess"] = (data, socket) => this.guessAction(this.parseDataAs(GuessData, data), socket)
    this.actions["anidle-autocomplete"] = (data, socket) => this.autocompleteAction(this.parseDataAs(QueryData, data), socket)
    this.actions["anidle-get-state"] = (data, socket) => this.getStateAction(this.parseDataAs(NoData, data), socket)
  }

  abstract startAction(data: StartData, sender: TSocket): void;

  abstract guessAction(data: GuessData, sender: TSocket): void;

  abstract autocompleteAction(data: QueryData, sender: TSocket): void;

  abstract getStateAction(data: NoData, sender: TSocket): void;

  sendLoading(data: LoadingData, recipient?: TSocket): void {
    this.send("anidle-loading", data, recipient)
  }

  sendInitGame(data: InitGameData, recipient?: TSocket): void {
    this.send("anidle-init-game", data, recipient)
  }

  sendGuessStart(data: GuessInfoData, recipient?: TSocket): void {
    this.send("anidle-guess-start", data, recipient)
  }

  sendGuessResult(data: GuessResultEventData, recipient?: TSocket): void {
    this.send("anidle-guess-result", data, recipient)
  }

  sendRepeatGuess(data: RepeatGuessData, recipient?: TSocket): void {
    this.send("anidle-repeat-guess", data, recipient)
  }

  sendAutocompleteResult(data: AutocompleteResultData, recipient?: TSocket): void {
    this.send("anidle-autocomplete-result", data, recipient)
  }

  sendWin(data: WinData, recipient?: TSocket): void {
    this.send("anidle-win", data, recipient)
  }
}
AnidleServiceBase.prototype.id = "anidle"
