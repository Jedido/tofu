/* eslint-disable */
// AUTO-GENERATED from shared/specs/gachaSpec.ts — do not edit.
// Run `npm run generate -- gacha` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const NoData = z.unknown();

export type NoData = z.infer<typeof NoData>;

const RecruitData = z.object({ index: z.number() });

export type RecruitData = z.infer<typeof RecruitData>;

const GachaUnitData = z.record(z.string(), z.unknown());

export type GachaUnitData = z.infer<typeof GachaUnitData>;

const StartData = z.array(z.number());

export type StartData = z.infer<typeof StartData>;

const RecruitResultData = z.object({
  index: z.number(),
  character: GachaUnitData,
});

export type RecruitResultData = z.infer<typeof RecruitResultData>;

const SummaryData = z.record(z.string(), z.unknown());

export type SummaryData = z.infer<typeof SummaryData>;

const StatsData = z.object({
  history: z.array(GachaUnitData),
  pity: z.number(),
});

export type StatsData = z.infer<typeof StatsData>;

export abstract class GachaServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "gacha-start-recruit": this.startRecruitAction(this.parseDataAs(NoData, data), socket); break
      case "gacha-recruit": this.recruitAction(this.parseDataAs(RecruitData, data), socket); break
      case "gacha-end-recruit": this.endRecruitAction(this.parseDataAs(NoData, data), socket); break
      case "gacha-get-stats": this.getStatsAction(this.parseDataAs(NoData, data), socket); break
    }
  }

  abstract startRecruitAction(data: NoData, sender: TSocket): void;

  abstract recruitAction(data: RecruitData, sender: TSocket): void;

  abstract endRecruitAction(data: NoData, sender: TSocket): void;

  abstract getStatsAction(data: NoData, sender: TSocket): void;

  sendStart(data: StartData, recipient?: TSocket): void {
    this.send("gacha-start", data, recipient)
  }

  sendRecruitResult(data: RecruitResultData, recipient?: TSocket): void {
    this.send("gacha-recruit-result", data, recipient)
  }

  sendSummary(data: SummaryData, recipient?: TSocket): void {
    this.send("gacha-summary", data, recipient)
  }

  sendStats(data: StatsData, recipient?: TSocket): void {
    this.send("gacha-stats", data, recipient)
  }
}
GachaServiceBase.prototype.id = "gacha"
