import { createStore } from "vuex"

export const store = createStore({
  state() {
    return {
      room: "",
      scene: "select",
      id: "",
      ign: "",
      sceneWidth: 0,
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
    setSceneWidth(state, width) {
      state.sceneWidth = width
    },
    setSidebarWidth(state, width) {
      state.sceneWidth += state.sidebarWidth - width
      state.sidebarWidth = width
    },
    leaveRoom(state) {
      state.room = ""
      state.scene = "select"
    },
  },
})
