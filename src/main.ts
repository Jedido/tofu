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
type AxiosRecord = Record<string, (...args: unknown[]) => Promise<unknown>>
const axiosAny = axios as unknown as AxiosRecord
methods.forEach((method) => {
  axiosAny[`$${method}`] = async (...args: unknown[]) => {
    const res = (await axiosAny[method](...args)) as {
      status: number
      data: unknown
    }
    if (res.status !== 200) {
      console.error(`Request failed with status ${res.status}`, args)
    }
    return res.data
  }
})
app.mount("#app")
