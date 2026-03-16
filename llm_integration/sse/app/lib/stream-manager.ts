type Listener = (chunk: string, index: number) => void

type StreamEntry = {
  chunks: string[]
  done: boolean
  listeners: Set<Listener>
}

const streams = new Map<string, StreamEntry>()

export function create(id: string) {
  streams.set(id, { chunks: [], done: false, listeners: new Set() })
}

export function get(id: string) {
  return streams.get(id)
}

export function push(id: string, chunk: string) {
  const entry = streams.get(id)!
  const index = entry.chunks.length
  entry.chunks.push(chunk)
  for (const fn of entry.listeners) fn(chunk, index)
}

export function finish(id: string) {
  const entry = streams.get(id)
  if (entry) entry.done = true
}

export function subscribe(id: string, fn: Listener) {
  streams.get(id)?.listeners.add(fn)
}

export function unsubscribe(id: string, fn: Listener) {
  streams.get(id)?.listeners.delete(fn)
}

setInterval(() => {
  for (const [id, entry] of streams) {
    if (entry.done && entry.listeners.size === 0) streams.delete(id)
  }
}, 60_000)
