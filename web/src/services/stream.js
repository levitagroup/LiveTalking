// src/services/stream.js
import { req } from "./http.js";
import { API_BASE } from "./config.js";
import { removeInformazioniAggiuntive } from "../utils/removeInfo.js";

export async function stream(sessionId, prompt) {
  const res = await req(`${API_BASE}/sessions/${sessionId}/messages`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt })
  });
  if (!res.ok) {
    throw await res.json();
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return {
    async read() {
      const { value, done } = await reader.read();
      if (done) return { value, done };
      const chunk       = decoder.decode(value, { stream: true });
      const cleaned     = removeInformazioniAggiuntive(chunk);
      const cleanedBuf  = encoder.encode(cleaned);
      return { value: cleanedBuf, done: false };
    },
    cancel(reason) {
      return reader.cancel(reason);
    }
  };
}
