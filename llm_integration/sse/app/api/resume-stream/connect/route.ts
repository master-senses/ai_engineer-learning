import * as manager from "@/app/lib/stream-manager"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const streamId = url.searchParams.get("id")!
  const lastEventId = req.headers.get("Last-Event-ID")
  const startFrom = lastEventId ? parseInt(lastEventId) + 1 : 0

  const entry = manager.get(streamId)
  if (!entry) return new Response("stream not found", { status: 404 })

  const out = new ReadableStream({
    start(controller) {
      // replay missed chunks
      for (let i = startFrom; i < entry.chunks.length; i++) {
        controller.enqueue(`id: ${i}\ndata: ${entry.chunks[i]}\n\n`)
      }

      if (entry.done) {
        controller.enqueue(`data: [DONE]\n\n`)
        controller.close()
        return
      }

      // live: forward new chunks as they come
      const listener = (chunk: string, index: number) => {
        try {
          controller.enqueue(`id: ${index}\ndata: ${chunk}\n\n`)
        } catch {}
      }

      const doneCheck = setInterval(() => {
        if (entry.done) {
          try {
            controller.enqueue(`data: [DONE]\n\n`)
            controller.close()
          } catch {}
          manager.unsubscribe(streamId, listener)
          clearInterval(doneCheck)
        }
      }, 200)

      manager.subscribe(streamId, listener)

      req.signal.addEventListener("abort", () => {
        manager.unsubscribe(streamId, listener)
        clearInterval(doneCheck)
      })
    },
  })

  return new Response(out, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
