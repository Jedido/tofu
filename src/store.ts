import { createStore, Store } from "vuex"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

export interface State {
  room: string
  scene: string
  id: string
  ign: string
  gameWidth: number
  screenWidth: number
  scale: number
}

export const store = createStore<State>({
  state() {
    return {
      room: "",
      scene: "select",
      id: "",
      ign: "",
      gameWidth: 0,
      screenWidth: 0,
      scale: 1
    }
  },
  mutations: {
    setRoom(state, room: string) {
      state.room = room
    },
    setScene(state, scene: string) {
      state.scene = scene
    },
    setIgn(state, ign: string) {
      state.ign = ign
    },
    setId(state, id: string) {
      state.id = id
    },
    setGameWidth(state, width: number) {
      state.gameWidth = Math.max(Math.min(width, 768), 300)
    },
    setScreenWidth(state, width: number) {
      state.screenWidth = width
    },
    changeScale(state, delta: number) {
      if (state.scale + delta > 0) {
        state.scale = Math.round((state.scale + delta) * 10) / 10
      }
    },
    leaveRoom(state) {
      state.room = ""
      state.scene = "select"
    },
  },
})
