const { getDurationMs } = require("../utils/timing")

interface RetryConfig {
  maxRetries: number
  delayMs: number
  retryableStatuses: number[]
}

export class BaseHttpClient<In, Out> {
  name: string = "http-client"
  retryConfig?: RetryConfig

  constructor(name: string, retryConfig?: RetryConfig) {
    this.name = name
    this.retryConfig = retryConfig
  }

  convertInToRequest(_: In): Request {
    throw new Error(`method not implemented in ${typeof(this)}`)
  }

  convertOutFromResponse(_: string, __: In): Out {
    throw new Error(`method not implemented in ${typeof(this)}`)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetch(input: In): Promise<Out> {
    const start = process.hrtime()
    const request = this.convertInToRequest(input)
    
    let attempt = 0
    let lastError: Error | null = null
    
    while (attempt <= (this.retryConfig?.maxRetries ?? 0)) {
      try {
        if (attempt > 0) {
          await this.delay(this.retryConfig?.delayMs ?? 0)
        }

        const res = await fetch(request)
        
        if (!res.ok && this.retryConfig?.retryableStatuses?.includes(res.status)) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const out = this.convertOutFromResponse(await res.text(), input)
        console.log({
          cat: "client",
          client: this.name,
          url: request.url,
          method: request.method,
          status: res.status,
          attempt: attempt + 1,
          durationms: getDurationMs(start),
          in: this.stringifyIn(input),
          out: this.stringifyOut(out)
        })
        return out
      } catch (error) {
        lastError = error as Error
        console.log({
          cat: "client",
          client: this.name,
          url: request.url,
          attempt,
          error: lastError.message,
          retry: attempt < (this.retryConfig?.maxRetries ?? 0)
        })
        if (!this.retryConfig || attempt >= this.retryConfig.maxRetries) {
          break
        }
      }
      attempt++
    }

    throw lastError || new Error("Request failed after all retries")
  }

  stringifyIn(req: In): string {
    return JSON.stringify(req)?.substring(0, 200)
  }

  stringifyOut(out: Out): string {
    return JSON.stringify(out)?.substring(0, 200)
  }
}