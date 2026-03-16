"use client"

async function get_sse(prompt: string, temp: number, signal: AbortSignal) {
    const response = await fetch("/api/llm-stream" , {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        },
        body: JSON.stringify({prompt, temp}),
        signal: signal
    })
    // console.log("response")
    // console.log(response)
    // for await (const str of response.body)) {
    //     console.log(str)
    // }
    // console.log(response.body)
    return new Response(response.body, {headers: {"Content-Type": "text/event-stream"}})
}
export default get_sse;
