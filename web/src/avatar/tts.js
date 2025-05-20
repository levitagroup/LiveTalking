// src/avatar/tts.js
import { AVATAR_ORIGIN } from "./config.js";

export async function speakAvatar(sessionId, audioEl, text) {
  const res = await fetch(`${AVATAR_ORIGIN}/human`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      sessionid: sessionId,
      type:      "echo",
      interrupt: true,
      text
    })
  });
  if (!res.ok) {
    console.error("Failed to call /human:", res.status, await res.text());
  }
  audioEl.play().catch(() => {});
}
