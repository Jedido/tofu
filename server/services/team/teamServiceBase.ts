/* eslint-disable */
// AUTO-GENERATED from shared/specs/teamSpec.ts — do not edit.
// Run `npm run generate -- team` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const NoData = z.unknown();

export type NoData = z.infer<typeof NoData>;

const SubmissionData = z.object({
  type: z.string(),
  id: z.number(),
  data: z.unknown(),
  stack: z.number(),
});

export type SubmissionData = z.infer<typeof SubmissionData>;

const WireCutData = z.object({ next: z.number() });

export type WireCutData = z.infer<typeof WireCutData>;

const StartEventData = z.unknown();

export type StartEventData = z.infer<typeof StartEventData>;

const FailData = z.object({ id: z.number(), stack: z.number() });

export type FailData = z.infer<typeof FailData>;

const SolveData = z.object({ id: z.number() });

export type SolveData = z.infer<typeof SolveData>;

const CutSuccessData = z.object({
  next: z.number(),
  success: z.boolean(),
});

export type CutSuccessData = z.infer<typeof CutSuccessData>;

const LoseData = z.object({ cause: z.string() });

export type LoseData = z.infer<typeof LoseData>;

const WinData = z.null();

export type WinData = z.infer<typeof WinData>;

export abstract class TeamServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "team-start": this.startAction(this.parseDataAs(NoData, data), socket); break
      case "team-submit": this.submitAction(this.parseDataAs(SubmissionData, data), socket); break
      case "team-cut": this.cutAction(this.parseDataAs(WireCutData, data), socket); break
      case "team-next": this.nextAction(this.parseDataAs(NoData, data), socket); break
      case "team-state": this.stateAction(this.parseDataAs(NoData, data), socket); break
    }
  }

  abstract startAction(data: NoData, sender: TSocket): void;

  abstract submitAction(data: SubmissionData, sender: TSocket): void;

  abstract cutAction(data: WireCutData, sender: TSocket): void;

  abstract nextAction(data: NoData, sender: TSocket): void;

  abstract stateAction(data: NoData, sender: TSocket): void;

  sendStart(data: StartEventData, recipient?: TSocket): void {
    this.send("team-start", data, recipient)
  }

  sendFail(data: FailData, recipient?: TSocket): void {
    this.send("team-fail", data, recipient)
  }

  sendSolve(data: SolveData, recipient?: TSocket): void {
    this.send("team-solve", data, recipient)
  }

  sendCutSuccess(data: CutSuccessData, recipient?: TSocket): void {
    this.send("team-cut-success", data, recipient)
  }

  sendLose(data: LoseData, recipient?: TSocket): void {
    this.send("team-lose", data, recipient)
  }

  sendWin(data: WinData, recipient?: TSocket): void {
    this.send("team-win", data, recipient)
  }
}
TeamServiceBase.prototype.id = "team"
