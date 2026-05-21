/* eslint-disable */
// AUTO-GENERATED from shared/specs/tileSpec.ts — do not edit.
// Run `npm run generate -- tile` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const NoData = z.unknown();

export type NoData = z.infer<typeof NoData>;

const MoveData = z.object({
  unit: z.string(),
  direction: z.number(),
});

export type MoveData = z.infer<typeof MoveData>;

const PaintData = z.object({
  unit: z.string(),
  color: z.string(),
});

export type PaintData = z.infer<typeof PaintData>;

const UnitData = z.object({ unit: z.string() });

export type UnitData = z.infer<typeof UnitData>;

const StateData = z.unknown();

export type StateData = z.infer<typeof StateData>;

const UpdateUnitData = z.unknown();

export type UpdateUnitData = z.infer<typeof UpdateUnitData>;

const CompleteOrderData = z.object({
  order: z.string(),
  unit: z.string(),
});

export type CompleteOrderData = z.infer<typeof CompleteOrderData>;

const NewOrderData = z.unknown();

export type NewOrderData = z.infer<typeof NewOrderData>;

const GrantToolsData = z.unknown();

export type GrantToolsData = z.infer<typeof GrantToolsData>;

const GameOverData = z.object({ ordersCompleted: z.number() });

export type GameOverData = z.infer<typeof GameOverData>;

export abstract class TileServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "tile-start": this.startAction(this.parseDataAs(NoData, data), socket); break
      case "tile-get-state": this.getStateAction(this.parseDataAs(NoData, data), socket); break
      case "tile-move": this.moveAction(this.parseDataAs(MoveData, data), socket); break
      case "tile-paint": this.paintAction(this.parseDataAs(PaintData, data), socket); break
      case "tile-append": this.appendAction(this.parseDataAs(UnitData, data), socket); break
      case "tile-submit": this.submitAction(this.parseDataAs(UnitData, data), socket); break
    }
  }

  abstract startAction(data: NoData, sender: TSocket): void;

  abstract getStateAction(data: NoData, sender: TSocket): void;

  abstract moveAction(data: MoveData, sender: TSocket): void;

  abstract paintAction(data: PaintData, sender: TSocket): void;

  abstract appendAction(data: UnitData, sender: TSocket): void;

  abstract submitAction(data: UnitData, sender: TSocket): void;

  sendState(data: StateData, recipient?: TSocket): void {
    this.send("tile-state", data, recipient)
  }

  sendUpdateUnit(data: UpdateUnitData, recipient?: TSocket): void {
    this.send("tile-update-unit", data, recipient)
  }

  sendCompleteOrder(data: CompleteOrderData, recipient?: TSocket): void {
    this.send("tile-complete-order", data, recipient)
  }

  sendNewOrder(data: NewOrderData, recipient?: TSocket): void {
    this.send("tile-new-order", data, recipient)
  }

  sendGrantTools(data: GrantToolsData, recipient?: TSocket): void {
    this.send("tile-grant-tools", data, recipient)
  }

  sendGameOver(data: GameOverData, recipient?: TSocket): void {
    this.send("tile-game-over", data, recipient)
  }
}
TileServiceBase.prototype.id = "tile"
