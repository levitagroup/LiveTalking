// src/services/sessions.js
import { req } from "./http.js";
import { API_BASE } from "./config.js";
import { removeInformazioniAggiuntive } from "../utils/removeInfo.js";

/**
 * Fetch the list of chat sessions.
 */
export async function listSessions() {
  console.debug("[sessions] listSessions → GET", `${API_BASE}/sessions`);
  const res = await req(`${API_BASE}/sessions`);
  console.debug("[sessions] listSessions ← status", res.status);
  const sessions = await res.json();
  console.debug("[sessions] listSessions ← body", sessions);
  return sessions;
}

/**
 * Fetch the message history for a given session.
 */
export async function history(sessionId) {
  console.debug(
    "[sessions] history → GET",
    `${API_BASE}/sessions/${sessionId}/messages`
  );
  const res = await req(
    `${API_BASE}/sessions/${sessionId}/messages`
  );
  console.debug("[sessions] history ← status", res.status);
  const messages = await res.json();
  console.debug("[sessions] history ← raw messages", messages);
  const cleaned = messages.map((msg) => {
    const content = removeInformazioniAggiuntive(msg.content);
    return { ...msg, content };
  });
  console.debug("[sessions] history ← cleaned messages", cleaned);
  return cleaned;
}

/**
 * Create a new chat session.
 */
export async function startSession() {
  console.debug("[sessions] startSession → POST", `${API_BASE}/sessions`);
  const res = await req(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  console.debug("[sessions] startSession ← status", res.status);
  const body = await res.json();
  console.debug("[sessions] startSession ← body", body);
  return body;
}

/**
 * End (delete) a chat session.
 */
export async function endSession(sessionId) {
  console.debug(
    "[sessions] endSession → DELETE",
    `${API_BASE}/sessions/${sessionId}`
  );
  const res = await req(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
  });
  console.debug("[sessions] endSession ← status", res.status);
  return res;
}
