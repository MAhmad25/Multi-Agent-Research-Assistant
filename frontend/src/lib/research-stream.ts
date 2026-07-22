import type { ResearchEvent } from "@/types/research";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ResearchStreamError extends Error {}

export async function streamResearch(query: string, onEvent: (event: ResearchEvent) => void, signal: AbortSignal): Promise<void> {
      let response: Response;
      try {
            response = await fetch(`${API_BASE}/api/research/stream`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ query }),
                  signal,
            });
      } catch {
            throw new ResearchStreamError(`Couldn't reach the research API at ${API_BASE}. Is the backend running?`);
      }

      if (!response.ok || !response.body) {
            throw new ResearchStreamError(`Request failed with status ${response.status}.`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() ?? "";

            for (const chunk of chunks) {
                  const line = chunk.trim();
                  if (!line || line.startsWith(":")) continue;
                  if (!line.startsWith("data:")) continue;

                  const jsonStr = line.slice("data:".length).trim();
                  try {
                        onEvent(JSON.parse(jsonStr) as ResearchEvent);
                  } catch {
                        // Ignore a malformed chunk rather than killing the whole stream.
                  }
            }
      }
}
