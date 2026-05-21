/* eslint-disable */
// AUTO-GENERATED from server/specs/sandboxSpec.ts — do not edit.
// Run `npm run generate -- sandbox --force` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

export abstract class SandboxServiceBase extends GameService {
  constructor(roomId: string) {
    super(roomId)
  }
}
SandboxServiceBase.prototype.id = "sandbox"
