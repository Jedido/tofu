/* eslint-disable */
// AUTO-GENERATED from shared/specs/minesweeperSpec.ts — do not edit.
// Run `npm run generate -- minesweeper` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const GetBoardData = z.unknown();

export type GetBoardData = z.infer<typeof GetBoardData>;

const CoordData = z.object({ x: z.number(), y: z.number() });

export type CoordData = z.infer<typeof CoordData>;

const InitData = z.object({
  size: z.number(),
  bombs: z.number(),
});

export type InitData = z.infer<typeof InitData>;

const BoardData = z.object({
  status: z.string(),
  size: z.number(),
  mines: z.number(),
  board: z.array(z.array(z.number())),
  time: z.number(),
});

export type BoardData = z.infer<typeof BoardData>;

const UpdateSpaceData = z.object({
  x: z.number(),
  y: z.number(),
  value: z.number(),
});

export type UpdateSpaceData = z.infer<typeof UpdateSpaceData>;

export abstract class MinesweeperServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "minesweeper-get-board": this.getBoardAction(this.parseDataAs(GetBoardData, data), socket); break
      case "minesweeper-init": this.initAction(this.parseDataAs(InitData, data), socket); break
      case "minesweeper-reveal": this.revealAction(this.parseDataAs(CoordData, data), socket); break
      case "minesweeper-flag": this.flagAction(this.parseDataAs(CoordData, data), socket); break
    }
  }

  abstract getBoardAction(data: GetBoardData, sender: TSocket): void;

  abstract initAction(data: InitData, sender: TSocket): void;

  abstract revealAction(data: CoordData, sender: TSocket): void;

  abstract flagAction(data: CoordData, sender: TSocket): void;

  sendBoard(data: BoardData, recipient?: TSocket): void {
    this.send("minesweeper-board", data, recipient)
  }

  sendUpdateSpace(data: UpdateSpaceData, recipient?: TSocket): void {
    this.send("minesweeper-update-space", data, recipient)
  }
}
MinesweeperServiceBase.prototype.id = "minesweeper"
