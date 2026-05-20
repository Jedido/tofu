import config from "@/assets/config.ts"

export default {
  computed: {
    sm(): boolean {
      return (this as any).$store.state.gameWidth >= config.BREAKPOINT_SM
    },
    md(): boolean {
      return (this as any).$store.state.gameWidth >= config.BREAKPOINT_MD
    },
    lg(): boolean {
      return (this as any).$store.state.gameWidth >= config.BREAKPOINT_LG
    },
    mobile(): boolean {
      return window.innerWidth < config.BREAKPOINT_MD
    }
  },
}
