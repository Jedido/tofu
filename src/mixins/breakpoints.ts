import { defineComponent } from "vue"
import config from "@/assets/config.ts"

export default defineComponent({
  computed: {
    sm(): boolean {
      return this.$store.state.gameWidth >= config.BREAKPOINT_SM
    },
    md(): boolean {
      return this.$store.state.gameWidth >= config.BREAKPOINT_MD
    },
    lg(): boolean {
      return this.$store.state.gameWidth >= config.BREAKPOINT_LG
    },
    mobile(): boolean {
      return window.innerWidth < config.BREAKPOINT_MD
    },
  },
})
