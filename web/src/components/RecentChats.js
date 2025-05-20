// src/components/RecentChats.js
import { fmtAgo } from "../utils/fmtAgo.js";
import { userBubble, assistantBubble } from "../components/ChatMessages.js";

// state
let sessions = [];
let current  = null;

// keep sessions sorted
export function setSessions(arr) {
  sessions = [...arr].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}
export function getSessions() {
  return sessions;
}
export function currentId() {
  return current;
}

export async function loadHistory(id, panel, titleNode, fetchHist) {
  current = id;
  titleNode.textContent =
    (sessions.find(s => s.sessionId === id)?.title) ||
    "Assistente AI - Comune di Perugia";

  panel.innerHTML = "";

  const messages = await fetchHist(id);
  console.debug("[UI] loadHistory fetched", messages);

  messages.forEach(m => {
    if (m.role === "user") {
      userBubble(panel, m.content);
    } else {
      assistantBubble(panel, m.content);
    }
  });
}

// build the “recent chats” list
export function buildRecents(listEl, onClick) {
  listEl.innerHTML = "";
  sessions.forEach(meta => {
    const d = document.createElement("div");
    d.className = "recent-item";
    d.onclick = () => onClick(meta.sessionId);
    d.innerHTML = `
      <div class="info">
        <img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/usericon_1.png">
        <div class="meta">
          <div class="title">${meta.title}</div>
          <div class="time">
            ${meta.sessionId === current ? "Ora" : fmtAgo(meta.updatedAt)}
          </div>
        </div>
      </div>`;
    listEl.appendChild(d);
  });
}
