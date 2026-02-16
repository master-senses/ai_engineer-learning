import * as http from "http"

const PORT = 3001
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


const server = http.createServer(async (req, res) => {
    const statuscode = 200
    res.writeHead(statuscode, {
        "Content-Type": "text/event-stream",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache"
    })
    let i = 0
    while (i < 10) {
        res.write("test")
        i += 1
        await sleep(1000)
    }
    res.end()
}).listen(PORT)

// server.close()







