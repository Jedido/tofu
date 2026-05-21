/* eslint-disable */
// AUTO-GENERATED from shared/specs/jeopardySpec.ts — do not edit.
// Run `npm run generate -- jeopardy` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const NoData = z.unknown();

export type NoData = z.infer<typeof NoData>;

const StartGameData = z.object({
  jeopardy: z.string(),
  local: z.boolean(),
});

export type StartGameData = z.infer<typeof StartGameData>;

const AddPointsData = z.object({
  id: z.string(),
  points: z.union([z.number(), z.string()]),
});

export type AddPointsData = z.infer<typeof AddPointsData>;

const DisplayQuestionData = z.object({
  category: z.string(),
  points: z.number(),
});

export type DisplayQuestionData = z.infer<typeof DisplayQuestionData>;

const ShowSubmissionData = z.object({ show: z.boolean() });

export type ShowSubmissionData = z.infer<typeof ShowSubmissionData>;

const SubmitData = z.object({ submission: z.string() });

export type SubmitData = z.infer<typeof SubmitData>;

const PlayersData = z.array(
  z.object({ ign: z.string(), id: z.string(), points: z.number() })
);

export type PlayersData = z.infer<typeof PlayersData>;

const HostData = z.object({
  id: z.string().nullable(),
  ign: z.string(),
});

export type HostData = z.infer<typeof HostData>;

const CategoriesData = z.array(
  z.object({
    name: z.string(),
    questions: z.array(z.object({ points: z.number(), completed: z.boolean() })),
  })
);

export type CategoriesData = z.infer<typeof CategoriesData>;

const QuestionData = z.object({
  question: z.string(),
  answer: z.string(),
  points: z.number(),
  type: z.string().optional(),
});

export type QuestionData = z.infer<typeof QuestionData>;

const QuestionStateData = z.number();

export type QuestionStateData = z.infer<typeof QuestionStateData>;

const ToggleSubmissionData = z.boolean();

export type ToggleSubmissionData = z.infer<typeof ToggleSubmissionData>;

const LocalData = z.boolean();

export type LocalData = z.infer<typeof LocalData>;

const BuzzerData = z.string();

export type BuzzerData = z.infer<typeof BuzzerData>;

export abstract class JeopardyServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "jeopardy-start-game": this.startGameAction(this.parseDataAs(StartGameData, data), socket); break
      case "jeopardy-set-player": this.setPlayerAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-set-host": this.setHostAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-add-points": this.addPointsAction(this.parseDataAs(AddPointsData, data), socket); break
      case "jeopardy-display-categories": this.displayCategoriesAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-display-question": this.displayQuestionAction(this.parseDataAs(DisplayQuestionData, data), socket); break
      case "jeopardy-buzz": this.buzzAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-next-round": this.nextRoundAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-show-submission": this.showSubmissionAction(this.parseDataAs(ShowSubmissionData, data), socket); break
      case "jeopardy-submit": this.submitAction(this.parseDataAs(SubmitData, data), socket); break
      case "jeopardy-get-submissions": this.getSubmissionsAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-question-reset": this.questionResetAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-clear-buzzer": this.clearBuzzerAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-question-next": this.questionNextAction(this.parseDataAs(NoData, data), socket); break
      case "jeopardy-show-answer": this.showAnswerAction(this.parseDataAs(NoData, data), socket); break
    }
  }

  abstract startGameAction(data: StartGameData, sender: TSocket): void;

  abstract setPlayerAction(data: NoData, sender: TSocket): void;

  abstract setHostAction(data: NoData, sender: TSocket): void;

  abstract addPointsAction(data: AddPointsData, sender: TSocket): void;

  abstract displayCategoriesAction(data: NoData, sender: TSocket): void;

  abstract displayQuestionAction(data: DisplayQuestionData, sender: TSocket): void;

  abstract buzzAction(data: NoData, sender: TSocket): void;

  abstract nextRoundAction(data: NoData, sender: TSocket): void;

  abstract showSubmissionAction(data: ShowSubmissionData, sender: TSocket): void;

  abstract submitAction(data: SubmitData, sender: TSocket): void;

  abstract getSubmissionsAction(data: NoData, sender: TSocket): void;

  abstract questionResetAction(data: NoData, sender: TSocket): void;

  abstract clearBuzzerAction(data: NoData, sender: TSocket): void;

  abstract questionNextAction(data: NoData, sender: TSocket): void;

  abstract showAnswerAction(data: NoData, sender: TSocket): void;

  sendUpdatePlayers(data: PlayersData, recipient?: TSocket): void {
    this.send("jeopardy-update-players", data, recipient)
  }

  sendUpdateHost(data: HostData, recipient?: TSocket): void {
    this.send("jeopardy-update-host", data, recipient)
  }

  sendShowCategories(data: CategoriesData, recipient?: TSocket): void {
    this.send("jeopardy-show-categories", data, recipient)
  }

  sendShowQuestion(data: QuestionData, recipient?: TSocket): void {
    this.send("jeopardy-show-question", data, recipient)
  }

  sendSetQuestionState(data: QuestionStateData, recipient?: TSocket): void {
    this.send("jeopardy-set-question-state", data, recipient)
  }

  sendToggleSubmission(data: ToggleSubmissionData, recipient?: TSocket): void {
    this.send("jeopardy-toggle-submission", data, recipient)
  }

  sendSetLocal(data: LocalData, recipient?: TSocket): void {
    this.send("jeopardy-set-local", data, recipient)
  }

  sendBuzzer(data: BuzzerData, recipient?: TSocket): void {
    this.send("jeopardy-buzzer", data, recipient)
  }
}
JeopardyServiceBase.prototype.id = "jeopardy"
