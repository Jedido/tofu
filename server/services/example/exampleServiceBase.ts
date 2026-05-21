/* eslint-disable */
// AUTO-GENERATED from shared/specs/exampleSpec.ts — do not edit.
// Run `npm run generate -- example` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const SendMessageData = z.string();

export type SendMessageData = z.infer<typeof SendMessageData>;

const ReceiveMessageData = z.object({
  ign: z.string(),
  message: z.string(),
});

export type ReceiveMessageData = z.infer<typeof ReceiveMessageData>;

export abstract class ExampleServiceBase extends GameService {
  override dispatch(action: string, data: unknown, socket: TSocket): void {
    switch (action) {
      case "example-send-message": this.sendMessageAction(this.parseDataAs(SendMessageData, data), socket); break
    }
  }

  abstract sendMessageAction(data: SendMessageData, sender: TSocket): void;

  sendReceiveMessage(data: ReceiveMessageData, recipient?: TSocket): void {
    this.send("example-receive-message", data, recipient)
  }
}
ExampleServiceBase.prototype.id = "example"
