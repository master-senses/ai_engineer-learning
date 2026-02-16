"use client";

import { useEffect } from "react";
export default function Page() {
  useEffect(() => {
    const evtSource = new EventSource("http://localhost:3001/server", {
    });
    
    evtSource.onmessage = (event) => {
      console.log("message:", JSON.parse(event.data));
    };

    evtSource.onerror = (err) => {
      console.error("EventSource error:", err);
    };
    
    // return () => evtSource.close();  // cleanup on unmount
  }, []);
  
  return <div>Hello World</div>
}

