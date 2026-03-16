import Anthropic from "@anthropic-ai/sdk"
import * as dotenv from "dotenv"
import * as manager from "@/app/lib/stream-manager"
dotenv.config()

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY })

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const streamId = crypto.randomUUID()

  manager.create(streamId)

  // fire and forget — runs independently of any client
  ;(async () => {
    let stream = client.messages.stream({
      messages: [{ role: "user", content: prompt }],
      model: "claude-haiku-4-5",
      max_tokens: 1024,
    })
    for await (const str of stream) {
      if (str.type === "content_block_delta" && str.delta.type === "text_delta") {
        manager.push(streamId, str.delta.text)
      }
    }
    manager.finish(streamId)
  })()

  return Response.json({ streamId })
}
