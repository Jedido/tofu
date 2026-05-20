import { createApp } from "vue"
import App from "@/App.vue"
import axios from "axios"
import VueAxios from "vue-axios"
import { store } from "@/store.ts"
import "./index.css"

const app = createApp(App)
app.use(store)
app.use(VueAxios, axios)
/*
  axios param 2 config:
  {
    params: {},
    data: {}
  }
*/
const methods = ["get", "post"] as const
methods.forEach((method) => {
  ;(axios as any)[`$${method}`] = async function () {
    const res = await (axios as any)[method](...arguments)
    if (res.status !== 200) {
      console.error(`Request ${arguments} filed with ${res}`)
    }
    return res.data
  }
})
app.mount("#app")
