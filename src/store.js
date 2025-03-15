import { createStore } from "vuex"

export const store = createStore({
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
    setRoom(state, room) {
      state.room = room
    },
    setScene(state, scene) {
      state.scene = scene
    },
    setIgn(state, ign) {
      state.ign = ign
    },
    setId(state, id) {
      state.id = id
    },
    setGameWidth(state, width) {
      state.gameWidth = Math.max(Math.min(width, 768), 300)
    },
    setScreenWidth(state, width) {
      state.screenWidth = width
    },
    changeScale(state, delta) {
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
