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
```

## Architecture

**Tofu** is a multiplayer party game platform. Vue 3 frontend + Express/Socket.IO backend + SQLite3. The frontend is served statically from `dist/` in production; in dev, Vue CLI's dev server proxies to Express.

### Backend (`server/`)

**Entry:** `server/server.js` — Express setup, serves `dist/`, initializes GameManager and DatabaseManager.

**Room/user management:** `server/gameManager.js` — the core WebSocket hub. Maintains a `users` Map (socket.id → TSocket) and `gameRooms` Map (roomId → `{game, gameId}`). Handles `create-room`, `join-room`, `leave-room`, `set-ign`, `action` socket events. Room IDs are 5 random uppercase letters; user IDs are `adjective-animal-number`.

**Game services:** Each game is a service in `server/services/` that extends `GameService`. A service must implement:
- `id` — the scene name string (used as event namespace)
- `join(socket)` / `leave(socket)`
- `actions` object mapping `"sceneName-actionName"` → `(data, socket) => void`

Services call `this.broadcastFn(event, data)` to push state to all room members. See `server/services/exampleService.js` as a template.

**Database:** `server/databaseManager.ts` wraps SQLite3 with two async helpers: `run(sql, ...args)` and `get(sql, ...args)`. Schema is initialized from `server/scripts/initDatabases.sql` on startup.

**Utilities:** `server/utils/tsocket.ts` (TSocket wraps a socket with user metadata), `cipher.ts`, `bitarray.ts`, `timing.ts`.

### Frontend (`src/`)

**No vue-router.** Routing is scene-based: `src/components/Scene.vue` uses `v-if` on `$store.state.scene` to mount the active game component (via `defineAsyncComponent`). Changing scenes means the server emits `set-scene` which updates the Vuex store.

**State:** `src/store.js` (Vuex 4). Global state: `room`, `scene`, `id`, `ign`, `gameWidth`, `screenWidth`, `scale`.

**Socket mixin:** `src/mixins/socket.js` — components use this to call `this.emit('action')` and `this.on('event', handler)`. It automatically prefixes event names with the current scene name and cleans up listeners on `unmount`.

**Component layout:** `src/App.vue` → `Header.vue` + `Scene.vue` → game component (e.g., `src/components/jeopardy/JeopardyGame.vue`). Each game lives in its own subdirectory under `src/components/`.

### Socket event flow

```
client:  socket.emit("action", "sceneName-actionName", data)
server:  gameManager receives "action" → dispatches to service.actions["sceneName-actionName"](data, user)
service: calls this.broadcastFn("event-name", payload)
client:  socket.on("event-name", handler)   // via socket mixin
```

### TypeScript migration

The backend is partially migrated — newer services (e.g., `anidleService.ts`, `tileService.ts`, `rpgService.ts`, `databaseManager.ts`) are already TypeScript. The `tsconfig.json` targets `server/**` only (ESNext/bundler, strict). Frontend Vue files are still JS. New backend files should be `.ts`.

The entire server uses ESM (`import`/`export`) — no `require()` or `module.exports`. Bun runs TypeScript natively so `.ts` files can be imported directly with their `.ts` extension.

## Key config files

- `tsconfig.json` — backend TS only, ESNext modules, `@/` alias maps to `server/`
- `jest.config.js` — ts-jest preset, tests under `server/tests/`
- `vite.config.js` — Vite dev server (port 8080), proxies `/socket.io` → backend at port 3001
- `tailwind.config.js` — custom color palette (amber, cyan, error, emerald, gray, white)
- ESLint config is inline in `package.json` — uses `eslint-plugin-vue` + `eslint:recommended` + prettier
