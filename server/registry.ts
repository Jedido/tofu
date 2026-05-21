/* eslint-disable */
// AUTO-GENERATED — do not edit manually.
// Run `npm run generate` to rebuild.
import type GameService from "./services/gameService.ts"
import AnagramService from "./services/anagram/anagramService.ts"
import AnidleService from "./services/anidle/anidleService.ts"
import ExampleService from "./services/example/exampleService.ts"
import GachaService from "./services/gacha/gachaService.ts"
import JeopardyService from "./services/jeopardy/jeopardyService.ts"
import MinesweeperService from "./services/minesweeper/minesweeperService.ts"
import SandboxService from "./services/sandbox/sandboxService.ts"
import SquaredleService from "./services/squaredle/squaredleService.ts"
import TeamService from "./services/team/teamService.ts"
import TileService from "./services/tile/tileService.ts"
import WatchService from "./services/watch/watchService.ts"

type GameServiceConstructor = new (roomId: string) => GameService

export const games: Record<string, GameServiceConstructor> = {
  "anagram": AnagramService,
  "anidle": AnidleService,
  "example": ExampleService,
  "gacha": GachaService,
  "jeopardy": JeopardyService,
  "minesweeper": MinesweeperService,
  "sandbox": SandboxService,
  "squaredle": SquaredleService,
  "team": TeamService,
  "tile": TileService,
  "watch": WatchService,
}
