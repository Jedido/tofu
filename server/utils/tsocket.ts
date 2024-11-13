import { Socket } from "socket.io";

export class TSocket {
  socket: Socket
  ign: string
  id: string
  roomId: string = ''

  constructor(socket: Socket, ign: string) {
    this.socket = socket
    this.ign = ign
    this.id = socket.id
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
}