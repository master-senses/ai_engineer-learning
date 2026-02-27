"use client";

import { useEffect } from "react";
import get_sse from "./llm/page";
import { default as stream } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
export default function Page() {
  // useEffect(() => {
  //   const evtSource = new EventSource("http://localhost:3001/server", {
  //   });
    
  //   evtSource.onmessage = (event) => {
  //     console.log("message:", JSON.parse(event.data));
  //   };

  //   evtSource.onerror = (err) => {
  //     console.error("EventSource error:", err);
  //   };
    
  //   // return () => evtSource.close();  // cleanup on unmount
  // }, []);
  useEffect(() => {
    const run = async () => {
        const res = await get_sse("what's the weather in sf")
        const decoder = new TextDecoder()
        // const data = await res.json()
        // console.log("data")
        // console.log(data)
        const reader = res.body!.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          console.log(decoder.decode(value)) // readable stream is raw, have to decode
        }
    }
    run()
}, [])
  
  
  return <div>Hello World</div>
}

