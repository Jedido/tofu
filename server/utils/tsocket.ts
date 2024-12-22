import { Socket } from "socket.io"

import { v4 as uuidv4 } from 'uuid';
import { encrypt } from "./cipher";

export class TSocket {
  socket: Socket
  ign: string
  id: string
  roomId: string = ''

  constructor(socket: Socket, ign: string) {
    this.socket = socket
    this.ign = ign
    this.id = uuidv4()
  }

  emit(ev: string, ...args: any[]) {
    this.socket.emit(ev, ...args)
  }

  leave() {
    this.socket.leave(this.roomId)
    this.roomId = ''
  }

  join(room: string) {
    this.socket.join(room)
    this.roomId = room
  }

  details() {
    const encryption = encrypt(this.id)
    return {
      id: encryption.content,
      iv: encryption.iv,
      ign: this.ign
    }
  }
}