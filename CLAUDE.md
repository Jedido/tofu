# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start everything for local dev (Vite :8080 + backend :3001)
npm run build        # Vite production build to dist/
npm run prod         # Build + run production server on :8638 (serves dist/)
npm run lint         # ESLint check (no auto-fix)
npm test             # Jest tests in server/ (all test files)
npx jest --testPathPattern=<file>  # Run a single test file
npm run generate              # Regenerate all base files + registry
npm run generate -- <name>    # Regenerate one service base (scaffold service if missing)
```

## Architecture

**Tofu** is a multiplayer party game platform. Vue 3 frontend + Express/Socket.IO backend + SQLite3. The frontend is served statically from `dist/` in production; in dev, Vite's dev server proxies to Express.

### Directory layout

```
shared/               ← service interface contracts (shared between server and future frontend codegen)
  generate.ts         ← code generator script
  baseSpec.ts         ← DataType / Action / Message type markers
  specs/              ← one *Spec.ts per game service
server/
  registry.ts         ← auto-generated: exports `games` map (run `npm run generate` to rebuild)
  gameManager.ts      ← WebSocket hub, room/user management
  services/
    <name>/
      <name>ServiceBase.ts   ← auto-generated abstract base (do not edit)
      <name>Service.ts       ← user-owned implementation
  scripts/            ← one-off server scripts (fetchAnimeTitles.ts, initDatabases.sql)
  utils/              ← tsocket.ts, cipher.ts, bitarray.ts, timing.ts
src/                  ← Vue 3 frontend
```

### Game service architecture

Each game follows a three-layer pattern:

1. **Spec** (`shared/specs/<name>Spec.ts`) — declares `serviceName`, Zod data types, `Action` consts (client→server), and `Message` consts (server→client). This is the source of truth.

2. **Generated base** (`server/services/<name>/<name>ServiceBase.ts`) — produced by `npm run generate`. Wires actions into `this.actions`, declares abstract methods for each action, and provides typed `send*` methods for each event. **Never edit this file.**

3. **Service implementation** (`server/services/<name>/<name>Service.ts`) — user-written. Extends the base, implements each abstract action method, and may override `join(socket)` / `leave(socket)`.

```typescript
// shared/specs/exampleSpec.ts
export const serviceName = "example"
export const MsgData: DataType = z.object({ text: z.string() })
export const SendAction: Action = { action: "send", data: MsgData }
export const BroadcastEvent: Message = { event: "broadcast", data: MsgData }

// server/services/example/exampleService.ts  (user writes this)
export default class extends ExampleServiceBase {
  sendAction(data: MsgData, sender: TSocket) {
    this.sendBroadcast({ text: `${sender.ign}: ${data.text}` })
  }
}
```

**Spec conventions:**
- Action/event keys have NO service prefix in the spec — the generator adds `${serviceName}-` automatically.
- Use `z.nullish()` (not `.optional()`) for action data that may arrive as `null` from the frontend (Socket.IO serializes `undefined` → `null`).
- `Action` const name lowercased = abstract method name (`StartAction` → `startAction`).
- Event send method = `"send" + PascalCase(event key)` (`"guess-result"` → `sendGuessResult`).

### Backend entry points

**Entry:** `server/server.ts` — Express setup, serves `dist/`, initializes GameManager and DatabaseManager.

**Room/user management:** `server/gameManager.ts` — the core WebSocket hub. Maintains a `users` Map (socket.id → TSocket) and `gameRooms` Map (roomId → `{game, gameId}`). Handles `create-room`, `join-room`, `leave-room`, `set-ign`, `action` socket events. Room IDs are 5 random uppercase letters.

**Registry:** `server/registry.ts` — auto-generated map of `serviceId → ServiceConstructor`. Import `games` from here; do not edit manually.

**Database:** `server/databaseManager.ts` wraps SQLite3 with two async helpers: `run(sql, ...args)` and `get(sql, ...args)`. Schema is initialized from `server/scripts/initDatabases.sql` on startup.

### Socket event flow

```
client:  socket.emit("action", "sceneName-actionName", data)
server:  gameManager → service.actions["sceneName-actionName"](data, socket)
service: this.send<EventName>(payload)         // broadcast (no recipient)
         this.send<EventName>(payload, socket) // targeted send
client:  this.on("event-name", handler)        // socket mixin auto-prefixes scene name
```

### Frontend (`src/`)

**No vue-router.** Routing is scene-based: `src/components/Scene.vue` uses `v-if` on `$store.state.scene` to mount the active game component (via `defineAsyncComponent`). Changing scenes means the server emits `set-scene` which updates the Vuex store.

**State:** `src/store.js` (Vuex 4). Global state: `room`, `scene`, `id`, `ign`, `gameWidth`, `screenWidth`, `scale`.

**Socket mixin:** `src/mixins/socket.js` — components use `this.emit('action-name', data)` and `this.on('event-name', handler)`. It automatically prefixes event names with the current scene name and cleans up listeners on `unmount`.

**Component layout:** `src/App.vue` → `Header.vue` + `Scene.vue` → game component (e.g., `src/components/jeopardy/JeopardyGame.vue`). Each game lives in its own subdirectory under `src/components/`.

### TypeScript

`server/` and `shared/` are TypeScript — `tsconfig.json` includes both. Frontend Vue files are still JS. Bun runs TypeScript natively so `.ts` extensions are used directly in import paths.

## Key config files

- `tsconfig.json` — covers `server/**`, `shared/**`, `src/**`; ESNext/bundler modules, strict
- `jest.config.js` — ts-jest preset, tests under `server/tests/`
- `vite.config.js` — Vite dev server (port 8080), proxies `/socket.io` → backend at port 3001
- `tailwind.config.js` — custom color palette (amber, cyan, error, emerald, gray, white)
- ESLint config is inline in `package.json` — uses `eslint-plugin-vue` + `eslint:recommended` + prettier
