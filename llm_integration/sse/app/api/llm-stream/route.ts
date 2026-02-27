import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from 'dotenv';
dotenv.config()

const anth_api = process.env.ANTHROPIC_KEY

const client = new Anthropic({apiKey: anth_api});

const tools = [
  {
    name: "get_weather",
    description: "Get the current weather in a given location",
    input_schema: {
      type: "object" as const,
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA"
        }
      },
      required: ["location"]
    }
  }
]

export async function POST(req: Request) {
  const {prompt} = await req.json()
  let stream = client.messages.stream({
      messages: [{ role: "user", content: prompt}],
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      tools: tools,
      tool_choice: {"type": "tool", "name": "get_weather"}
    })

  const out = new ReadableStream({
    async start(controller) {
      let text = ""
      for await (const str of stream) {
        // console.log(str)
        if (str.type === "content_block_delta") {
          if (str.delta.type === "text_delta") {
            text += str.delta.text
            controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`)
          } else if (str.delta.type === "input_json_delta") {
            text += str.delta.partial_json
            controller.enqueue(`data: ${text}\n\n`)
          }
        }
      }
      controller.close()
    }
  })
  return new Response(out, {headers: {"Content-Type": "text/event-stream"}})
}









