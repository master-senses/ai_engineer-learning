"use client";

import { useEffect, useState } from "react";
import get_sse from "./llm/page";
import { default as stream } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
export default function Page() {
  const [results, setResults] = useState<string[]>([])
  // useEffect(() => {
  //   const evtSource = new EventSource("http://localhost:3001/server", {
  //   });
    
  //   evtSource.onmessage = (event) => {
  //     console.log("message:", JSON.parse(event.data));
  //   };

  //   evtSource.onerror = (err) => {
  //     console.error("EventSource error:", err);
  //   };
    
  //   return () => evtSource.close();  // cleanup on unmount
  // }, []);
  useEffect(() => {
    const controller = new AbortController()
    async function run() {
      const id = Math.random()
      console.log("effect fired", id); 
      let temp = -0.5
      
      for (let i = 0; i < 3; i++) {
        temp += 0.5
        try {
        const res = await get_sse("what's the weather in sf", temp, controller.signal)
        const decoder = new TextDecoder()
        const reader = res.body!.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
            setResults(prev => [...prev, decoder.decode(value)]) // we use prev instead of simple ...results as results can be stale

          }
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.log("AbortError")
            throw error
          }
        }
      }
    }
    run()
    console.log("results", results)
    return () => controller.abort()
}, [])
  
  
  return <div>{JSON.stringify(results)}</div>
}

