import config from "@/assets/config.js"

export default {
  computed: {
    sm() {
      return this.$store.state.gameWidth >= config.BREAKPOINT_SM
    },
    md() {
      return this.$store.state.gameWidth >= config.BREAKPOINT_MD
    },
    lg() {
      return this.$store.state.gameWidth >= config.BREAKPOINT_LG
    },
    mobile() {
      return window.innerWidth < config.BREAKPOINT_MD
    }
  },
}
