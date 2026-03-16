"use client"

import { useEffect, useState } from "react"

export default function ResumePage() {
  const [text, setText] = useState("")
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    let evtSource: EventSource | null = null

    async function start() {
      let streamId = sessionStorage.getItem("resumeStreamId")

      if (!streamId) {
        const res = await fetch("/api/resume-stream/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: "explain how computers work from first principles" }),
        })
        const data = await res.json()
        streamId = data.streamId
        sessionStorage.setItem("resumeStreamId", streamId!)
      }

      setStreaming(true)
      evtSource = new EventSource(`/api/resume-stream/connect?id=${streamId}`)

      evtSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          setStreaming(false)
          sessionStorage.removeItem("resumeStreamId")
          evtSource?.close()
          return
        }
        setText(prev => prev + event.data)
      }

      evtSource.onerror = () => {
        console.log("connection lost, EventSource will auto-reconnect...")
      }
    }

    start()
    return () => evtSource?.close()
  }, [])

  return (
    <div style={{ padding: 20, maxWidth: 700, fontFamily: "monospace" }}>
      <h2>resumable stream demo</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
      {streaming && <span>streaming...</span>}
    </div>
  )
}
