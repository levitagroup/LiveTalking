/* network helpers + auth + localStorage */

//const API_BASE  = "https://giorgio.ngrok.app/api";
const API_BASE  = "http://localhost:5001/api";
const ID_KEY    = "chatId";
const TOKEN_KEY = "apiToken";

/* ---------- id/token bootstrap --------------- */
let chatId = localStorage.getItem(ID_KEY);
if (!chatId) {
  chatId = Math.random().toString(36).substr(2, 10);
  localStorage.setItem(ID_KEY, chatId);
}
let token = localStorage.getItem(TOKEN_KEY) || null;

/* ---------- helper to strip “INFORMAZIONI AGGIUNTIVE” blocks ---------- */
function removeInformazioniAggiuntive(text) {
  // Matches from *** INFORMAZIONI AGGIUNTIVE *** through
  // *** FINE INFORMAZIONI AGGIUNTIVE ***, including newlines
  const pattern = /\*\*\* INFORMAZIONI AGGIUNTIVE \*\*\*[\s\S]*?\*\*\* FINE INFORMAZIONI AGGIUNTIVE \*\*\*/g;
  return text.replace(pattern, "");
}

/* ---------- internal helpers ----------------- */
async function login() {
  const r = await fetch(`${API_BASE}/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId })
  });
  if (!r.ok) throw new Error("login failed");
  token = (await r.json()).access_token;
  console.log(token);
  localStorage.setItem(TOKEN_KEY, token);
}

async function req(url, opts = {}) {
  console.log(url);
  opts.headers ||= {};
  opts.headers.Authorization = `Bearer ${token}`;
  let r = await fetch(url, opts);
  if (r.status === 401) {
    // token expired → re-login once
    await login();
    opts.headers.Authorization = `Bearer ${token}`;
    r = await fetch(url, opts);
  }
  return r;
}

/* ---------- exported API --------------------- */
export async function ensureAuth() {
  if (!token) await login();
}

export const listSessions = async () =>
  (await req(`${API_BASE}/sessions`)).json();

export const history = async id => {
  const res      = await req(`${API_BASE}/sessions/${id}/messages`);
  const messages = await res.json();
  // strip extra info from every message's content
  return messages.map(msg => ({
    ...msg,
    content: removeInformazioniAggiuntive(msg.content)
  }));
};

export const startSession = async () =>
  (await req(`${API_BASE}/sessions`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    "{}"
  })).json();

export const endSession = async id =>
  req(`${API_BASE}/sessions/${id}`, { method: "DELETE" });

/* returns reader for SSE-like stream (identical to old impl.) */
export async function stream(id, prompt) {
  const r = await req(`${API_BASE}/sessions/${id}/messages`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt })
  });
  if (!r.ok) throw await r.json();
  const reader = r.body.getReader();
  // Wrap reader to clean chunks on the fly
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  return {
    async read() {
      const { value, done } = await reader.read();
      if (done) return { value, done };
      const chunk      = decoder.decode(value, { stream: true });
      const cleaned    = removeInformazioniAggiuntive(chunk);
      const cleanedBuf = encoder.encode(cleaned);
      return { value: cleanedBuf, done: false };
    },
    cancel(reason) {
      return reader.cancel(reason);
    }
  };
}