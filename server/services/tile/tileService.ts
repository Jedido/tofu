import {
  TileServiceBase,
  type MoveData,
  type PaintData,
  type UnitData,
  type TSocket,
} from "./tileServiceBase.ts"
import { randomItem, shuffle } from "../../utils/util.ts"

enum TileType {
  FLOOR = 0,
  EXTEND_SINGLE = 1,
  EXTEND_DOUBLE = 2,
  EXTEND_DOUBLE_R = 3,
  EXTEND_DOUBLE_L = 4,
  WALL = 5,
  PAINT = 6,
  DELETE = 7,
  SUBMIT = 8,
}
enum Direction {
  NONE = -1,
  RIGHT = 0,
  UP_RIGHT = 1,
  UP_LEFT = 2,
  LEFT = 3,
  DOWN_LEFT = 4,
  DOWN_RIGHT = 5,
  ROTATE_LEFT = 6,
  ROTATE_RIGHT = 7,
}
enum ToolType {
  MOVE = "move",
  APPEND = "append",
  PAINT = "paint",
}

interface Block {
  top: number
  left: number
  right: number
  bottom: number
  color: string
}
interface Unit {
  id: string
  position: number
  block: Block
}
interface Order {
  id: string
  block: Block
  time: number
  blockID: string
}
interface Tool {
  type: ToolType
  command: string
}

function normalizedBlockID(block: Block) {
  const blockr1 = getRotation(block)
  const blockr2 = getRotation(blockr1)
  const blockr3 = getRotation(blockr2)
  return [
    blockID(block),
    blockID(blockr1),
    blockID(blockr2),
    blockID(blockr3),
  ].reduce((a, b) => (a < b ? a : b))
}
function getRotation(block: Block) {
  return {
    top: block.left,
    left: block.bottom,
    right: block.top,
    bottom: block.right,
    color: block.color,
  }
}
function blockID(block: Block) {
  const blockArray = [[0, 0]]
  if (block.top) blockArray.push([0, 1])
  if (block.left) blockArray.push([-1, 0])
  if (block.right) blockArray.push([1, 0])
  if (block.bottom) blockArray.push([0, -1])
  if (block.top === TileType.EXTEND_DOUBLE) blockArray.push([0, 2])
  if (block.left === TileType.EXTEND_DOUBLE) blockArray.push([-2, 0])
  if (block.right === TileType.EXTEND_DOUBLE) blockArray.push([2, 0])
  if (block.bottom === TileType.EXTEND_DOUBLE) blockArray.push([0, -2])
  if (
    block.top === TileType.EXTEND_DOUBLE_L ||
    block.left === TileType.EXTEND_DOUBLE_R
  )
    blockArray.push([-1, 1])
  if (
    block.top === TileType.EXTEND_DOUBLE_R ||
    block.right === TileType.EXTEND_DOUBLE_L
  )
    blockArray.push([1, 1])
  if (
    block.bottom === TileType.EXTEND_DOUBLE_R ||
    block.left === TileType.EXTEND_DOUBLE_L
  )
    blockArray.push([-1, -1])
  if (
    block.bottom === TileType.EXTEND_DOUBLE_L ||
    block.right === TileType.EXTEND_DOUBLE_R
  )
    blockArray.push([1, -1])
  while (blockArray.some(([x]) => x < 0)) {
    blockArray.forEach((coord) => coord[0]++)
  }
  while (blockArray.some(([, y]) => y < 0)) {
    blockArray.forEach((coord) => coord[1]++)
  }
  return `${block.color}-${blockArray
    .sort(([x0, y0], [x1, y1]) => x0 - x1 || y0 - y1)
    .map(([x, y]) => `${x},${y}`)
    .join(":")}`
}

const colors = ["red", "orange", "yellow", "green", "blue", "purple"]

export default class extends TileServiceBase {
  board: number[]
  units: Map<string, Unit>
  orders: Map<string, Order>
  gameState: string
  players: Map<string, Tool[]>
  ordersCompleted: number
  orderCount: number
  nextBlockTimer?: ReturnType<typeof setTimeout>

  constructor(roomId: string) {
    super(roomId)
    this.board = []
    this.units = new Map()
    this.orders = new Map()
    this.players = new Map()
    this.playerSockets = new Map()
    this.ordersCompleted = 0
    this.gameState = "menu"
    this.orderCount = 0
  }

  startAction(_data: unknown, _sender: TSocket) {
    this.gameState = "game"
    this.units = new Map()
    this.orders = new Map()
    this.players = new Map()
    this.playerSockets = new Map()
    this.getPlayers().forEach((socket: TSocket) => {
      this.players.set(socket.id, [])
    })
    this.board = Array.from({ length: 49 }, () => TileType.FLOOR)
    this.board[0] = TileType.EXTEND_SINGLE
    this.board[1] = TileType.EXTEND_DOUBLE
    this.board[2] = TileType.EXTEND_DOUBLE_L
    this.board[3] = TileType.EXTEND_DOUBLE_R
    this.board[4] = TileType.PAINT
    this.board[5] = TileType.WALL
    shuffle(this.board)
    this.ordersCompleted = 0
    this.orderCount = 0
    this.redistributeTools()

    this.getPlayers().forEach((socket: TSocket) => {
      const tools = this.players.get(socket.id)
      this.sendGrantTools({ tools }, socket)
    })

    this.sendState(this.getState())
    this.addOrder()
  }

  getStateAction(_data: unknown, socket: TSocket) {
    this.sendState(this.getState(), socket)
  }

  moveAction(move: MoveData, socket: TSocket) {
    if (
      !this.authorize(
        { type: ToolType.MOVE, command: move.direction.toString() },
        socket
      )
    )
      return
    const unit = this.units.get(move.unit)!
    let newPosition = unit.position
    const y = Math.floor(newPosition / 7)
    const x = Math.floor(newPosition % 7)
    const offset = (y + 1) % 2
    switch (move.direction) {
      case Direction.RIGHT:
        if (x === 6) return
        newPosition += 1
        break
      case Direction.LEFT:
        if (x === 0) return
        newPosition -= 1
        break
      case Direction.UP_RIGHT:
        if (x === 6 && offset === 1) return
        newPosition -= 7 - offset
        break
      case Direction.UP_LEFT:
        if (x === 0 && offset === 0) return
        newPosition -= 8 - offset
        break
      case Direction.DOWN_RIGHT:
        if (x === 6 && offset === 1) return
        newPosition += 7 + offset
        break
      case Direction.DOWN_LEFT:
        if (x === 0 && offset === 0) return
        newPosition += 6 + offset
        break
      case Direction.ROTATE_LEFT: {
        const temp = unit.block.top
        unit.block.top = unit.block.right
        unit.block.right = unit.block.bottom
        unit.block.bottom = unit.block.left
        unit.block.left = temp
        this.sendUpdateUnit({ unit })
        break
      }
      case Direction.ROTATE_RIGHT: {
        const temp2 = unit.block.top
        unit.block.top = unit.block.left
        unit.block.left = unit.block.bottom
        unit.block.bottom = unit.block.right
        unit.block.right = temp2
        this.sendUpdateUnit({ unit })
        break
      }
    }
    if (this.validatePosition(newPosition)) {
      unit.position = newPosition
      this.sendUpdateUnit({ unit })
    }
  }

  paintAction(target: PaintData, socket: TSocket) {
    if (
      !this.authorize({ type: ToolType.PAINT, command: target.color }, socket)
    )
      return
    const unit = this.units.get(target.unit)!
    if (this.board[unit.position] === TileType.PAINT) {
      unit.block.color = target.color
      this.sendUpdateUnit({ unit })
    }
  }

  appendAction(target: UnitData, socket: TSocket) {
    const unit = this.units.get(target.unit)!
    const tileType = this.board[unit.position]
    if (
      !this.authorize(
        { type: ToolType.APPEND, command: tileType.toString() },
        socket
      )
    )
      return
    if (tileType > TileType.FLOOR && tileType < TileType.WALL) {
      unit.block.bottom = tileType
    }
    this.sendUpdateUnit({ unit })
  }

  submitAction(target: UnitData, _socket: TSocket) {
    const unit = this.units.get(target.unit)!
    const tile = this.board[unit.position]
    if (tile !== TileType.FLOOR) return
    const unitID = normalizedBlockID(unit.block)
    for (const [key, value] of this.orders.entries()) {
      if (value.blockID === unitID) {
        this.orders.delete(key)
        this.units.delete(target.unit)
        this.ordersCompleted++
        this.sendCompleteOrder({ order: key, unit: target.unit })
        if (this.orders.size === 0) {
          clearTimeout(this.nextBlockTimer)
          this.addOrder()
        }
        return
      }
    }
    this.units.set(target.unit, {
      id: target.unit,
      block: { top: 0, left: 0, right: 0, bottom: 0, color: "gray" },
      position: unit.position,
    })
    this.sendUpdateUnit({ unit: this.units.get(target.unit) })
  }

  private addOrder() {
    const number = randomItem([2, 3, 4])
    const sides = [0, 0, 1, number]
    shuffle(sides)
    const newOrderBlock = {
      top: sides[0],
      left: sides[1],
      right: sides[2],
      bottom: sides[3],
      color: randomItem(colors),
    }
    const newOrder: Order = {
      id: this.orderCount.toString(),
      block: newOrderBlock,
      time: 90 - this.orderCount,
      blockID: normalizedBlockID(newOrderBlock),
    }
    this.orders.set(newOrder.id, newOrder)

    let position: number | undefined
    while (position === undefined || this.board[position] !== TileType.FLOOR) {
      position = Math.floor(Math.random() * 49)
    }
    const newUnit: Unit = {
      id: this.orderCount.toString(),
      block: { top: 0, left: 0, right: 0, bottom: 0, color: "gray" },
      position,
    }
    this.units.set(newUnit.id, newUnit)
    this.orderCount++
    this.sendNewOrder({ order: newOrder, unit: newUnit })
    setTimeout(() => this.expire(newOrder.id), 1000 * (newOrder.time + 5))
    this.nextBlockTimer = setTimeout(
      () => this.addOrder(),
      (newOrder.time / 2) * 1000
    )
  }

  private expire(orderID: string) {
    if (this.orders.has(orderID)) {
      this.gameState = "end"
      this.orders.clear()
      this.units.clear()
      clearTimeout(this.nextBlockTimer)
      this.sendGameOver({ ordersCompleted: this.ordersCompleted })
    }
  }

  private getState() {
    return {
      state: this.gameState,
      board: this.board,
      units: Array.from(this.units.values()),
      orders: Array.from(this.orders.values()),
    }
  }

  private validatePosition(i: number) {
    return (
      i >= 0 &&
      i < 49 &&
      this.board[i] !== TileType.WALL &&
      !Array.from(this.units.values()).some((unit) => unit.position === i)
    )
  }

  private redistributeTools() {
    const movements = Array.from({ length: 6 }, (_, i) => ({
      type: ToolType.MOVE,
      command: i.toString(),
    }))
    const rotations = Array.from({ length: this.players.size }, (_, i) => ({
      type: ToolType.MOVE,
      command: ((i % 2) + 6).toString(),
    }))
    const appends = Array.from({ length: 4 }, (_, i) => ({
      type: ToolType.APPEND,
      command: (i + 1).toString(),
    }))
    const paints = colors.map((color) => ({
      type: ToolType.PAINT,
      command: color,
    }))
    this.distributeTools(movements)
    this.distributeTools(rotations)
    this.distributeTools(appends)
    this.distributeTools(paints)
  }

  private distributeTools(tools: Tool[]) {
    shuffle(tools)
    const toolSets = Array.from(this.players.values())
    let i = Math.floor(Math.random() * toolSets.length)
    for (const tool of tools) {
      toolSets[i].push(tool)
      i = (i + 1) % toolSets.length
    }
  }

  private authorize(action: Tool, socket: TSocket) {
    const tools = this.players.get(socket.id)!
    return tools.find(
      (tool) => tool.type === action.type && tool.command === action.command
    )
  }
}
