// import * as http from "http"
import * as dotenv from 'dotenv';
dotenv.config()

const anth_api = process.env.ANTHROPIC_KEY

// const PORT = 3001
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// const server = http.createServer(async (req, res) => {
//     const statuscode = 200
//     res.writeHead(statuscode, {
//         "Content-Type": "text/event-stream",
//         "Access-Control-Allow-Origin": "*",
//         "X-Accel-Buffering": "no",
//         "Cache-Control": "no-cache"
//     })
//     let i = 0
//     while (i < 10) {
//         const data = {"value": "test"}
//         // default "message" event
//         res.write(`data: ${JSON.stringify(data)}\n\n`)
//         i += 1
//         await sleep(1000)
//     }
//     // res.end()
// }).listen(PORT)

// server.close()
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({apiKey: anth_api});

export async function POST() {
    // const {prompt} = await request.json()
  let stream = client.messages.stream({
      messages: [{ role: "user", content: "what is the capital of ethipia, and is it related to india"}],
      model: "claude-haiku-4-5",
      max_tokens: 1024
    })
    console.log("stream")

  const out = new ReadableStream({
    async start(controller) {
      let text = ""
      for await (const str of stream) {
        console.log(str)
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

// POST()
export async function POST2() {
  // const {prompt} = await request.json()
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
  let stream = client.messages.stream({
    messages: [{ role: "user", content: "what's the weather in sf"}],
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: tools,
    tool_choice: {"type": "tool", "name": "get_weather"}
  })
  const out = new ReadableStream({
    async start(controller) {
      let text = ""
      for await (const str of stream) {
        console.log(str)
        if (str.type === "content_block_delta") {
          if (str.delta.type === "text_delta")
            text += str.delta.text
          controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`)
        }
      }
      controller.close()
    }
  })
  console.log("stream")
}








