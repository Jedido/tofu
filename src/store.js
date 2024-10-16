import { createStore } from "vuex"

export const store = createStore({
  state() {
    return {
      room: "",
      scene: "select",
      id: "",
      ign: "",
      gameWidth: 0,
      sidebarWidth: 300,
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
      state.gameWidth = width
    },
    setSidebarWidth(state, width) {
      state.sidebarWidth = width
    },
    leaveRoom(state) {
      state.room = ""
      state.scene = "select"
    },
  },
})
