/* eslint-disable */
// AUTO-GENERATED from shared/specs/sandboxSpec.ts — do not edit.
// Run `npm run generate -- sandbox` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

export abstract class SandboxServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
  }
}
SandboxServiceBase.prototype.id = "sandbox"
