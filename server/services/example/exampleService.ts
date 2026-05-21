import {
  ExampleServiceBase,
  type SendMessageData,
  type TSocket,
} from "./exampleServiceBase.ts"

export default class extends ExampleServiceBase {
  sendMessageAction(data: SendMessageData, sender: TSocket) {
    this.sendReceiveMessage({ ign: sender.ign, message: data })
  }
}
