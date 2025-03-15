import { JsonSchema } from "../assets/schemas"
import { BaseHttpClient } from "./baseHttpClient"

interface AIQuery {
  messages: AIMessage[]
  schema?: JsonSchema
  options?: {
    temperature: number
  }
}

export interface AIMessage {
  role: "assistant" | "user" | "system"
  content: string
}

export class AIClient extends BaseHttpClient<AIQuery, any> {

  constructor(name: string = "ai-client") {
    super(name)
  }

  formatMessages(messages: AIMessage[]): string {
    let prompt = "";

    for (const message of messages) {
      prompt += `<|start_header_id|>${message.role}<|end_header_id|>\n${message.content}<|eot_id|>\n`
    }

    // Ensure it ends with the assistant's turn to generate a response
    prompt += `<|start_header_id|>assistant<|end_header_id|>\n`;

    return prompt;
  }

  convertInToRequest(input: AIQuery): Request {
    const url = `http://localhost:11434/api/generate`
    const config: RequestInit = {
      method: "POST",
      body: JSON.stringify({
        model: "llama3.2",
        prompt: this.formatMessages(input.messages),
        stream: false,
        format: input.schema?.getJsonSchema(),
        options: input.options
      })
    }
    return new Request(
      url,
      config
    )
  }

  convertOutFromResponse(res: string): any {
    const response = JSON.parse(res)
    if (response.response)
      return JSON.parse(response.response)
    return response
  }

  stringifyIn(req: AIQuery): string {
    const lastMessage = req.messages[req.messages.length - 1]
    return `${lastMessage.role}: ${lastMessage.content}`.substring(0, 200)
  }
}
