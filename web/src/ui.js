/* all DOM building / rendering – NO network here */
import { scrollBottom, fmtAgo } from "./utils.js";

let sessions = [];
let current  = null;

/* ---------- static parts ----------------------------------------- */
export const button = () => {
  const d   = document.createElement("div");
  d.className = "chat-button";
  d.innerHTML =
    '<img id="ai-button" src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/buttchat.png">';
  document.body.appendChild(d);
  return d;
};

export const frame = () => {
  const c = document.createElement("div");
  c.id = "chat-container";
  document.body.appendChild(c);
  return c;
};

export const head = root => {
  root.innerHTML = `
    <div id="chat-header">
      <img class="logo"
           src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/PGLOGO-scaled.png">
      <span class="title"></span>
      <svg class="menu-btn" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2"></circle>
        <circle cx="12" cy="12" r="2"></circle>
        <circle cx="12" cy="19" r="2"></circle>
      </svg>
      <img class="close-chat-btn"
           src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/xicon.png">
    </div>
    <div id="header-menu">
      <button id="menu-new">Nuova Chat</button>
      <button id="menu-end">Chiudi Chat</button>
      <button id="menu-view">Chat Recenti</button>
    </div>
    <div id="recent-chats">
      <div id="recent-header">
        <img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/btnBack.png"
             class="back-btn"><span>Chat recenti</span>
      </div>
      <div id="recent-list"></div>
    </div>`;
  return {
    bar        : root.querySelector("#chat-header"),
    title      : root.querySelector(".title"),
    menuBtn    : root.querySelector(".menu-btn"),
    closeBtn   : root.querySelector(".close-chat-btn"),
    menu       : root.querySelector("#header-menu"),
    newBtn     : root.querySelector("#menu-new"),
    endBtn     : root.querySelector("#menu-end"),
    viewBtn    : root.querySelector("#menu-view"),
    recentPane : root.querySelector("#recent-chats"),
    recentList : root.querySelector("#recent-list"),
    backRecent : root.querySelector(".back-btn")
  };
};

export const main = root => {
  const panel = document.createElement("div");
  panel.id = "chat-messages";
  root.appendChild(panel);

  const box = document.createElement("div");
  box.id = "chat-input-container";
  box.innerHTML = `
    <input id="chat-input" type="text" placeholder="Scrivi qui il tuo messaggio…">
    <div class="listening-waves">${"<div></div>".repeat(5)}</div>
    <div id="chat-buttons-container">
      <div id="audio-buttons-container">
        <button class="control-button" id="recBtn">🎤</button>
        <button class="control-button" style="display: none;" id="ttsBtn">🔇</button>
      </div>
      <button class="send-button" id="sendBtn"><img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/RedSendIcon.png" width="40px" height="35px"></button>
    </div>`;
  root.appendChild(box);

  /* Global (delegated) copy handler – works even if per-bubble
     listener isn’t attached for some reason                                */
  panel.addEventListener("click", e => {
    const btn = e.target.closest(".assistant-controls button");
    if (!btn) return;
    e.stopPropagation();
    const wrap = btn.parentNode.previousElementSibling;          // .assistant-content
    const tip  = btn.parentNode.querySelector(".tooltiptext");
    navigator.clipboard.writeText(wrap.textContent || "");
    tip.textContent = "Copiato";
    setTimeout(() => (tip.textContent = "Copia"), 1500);
  });

  return {
    panel,
    input   : box.querySelector("#chat-input"),
    waves   : box.querySelector(".listening-waves"),
    recBtn  : box.querySelector("#recBtn"),
    ttsBtn  : box.querySelector("#ttsBtn"),
    sendBtn : box.querySelector("#sendBtn")
  };
};

/* ---------- bubbles ------------------------------------------------ */
export const userBubble = (panel, text) => {
  const d = document.createElement("div");
  d.className = "user-message";
  d.innerHTML = `
    <div class="user-text">${text}</div>
    <img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/usericon_1.png"
         style="width:35px;height:35px;border-radius:5px">`;
  panel.appendChild(d);
  scrollBottom(panel);
};

function addCopy(wrap) {
  const controls = document.createElement("div");
  controls.className = "assistant-controls";
  controls.innerHTML = `
    <span class="tooltiptext">Copia</span>
    <button><img class="copy-btn-img"
           src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/copyicon.png"></button>`;
  wrap.parentNode.appendChild(controls);

  /* Per-bubble listener (legacy) – stopPropagation so the click
     isn’t swallowed by markdown links or other overlays           */
  const tip = controls.querySelector(".tooltiptext");
  controls.querySelector("button").addEventListener("click", e => {
    e.stopPropagation();
    navigator.clipboard.writeText(wrap.textContent || "");
    tip.textContent = "Copiato";
    setTimeout(() => (tip.textContent = "Copia"), 1500);
  });
}

export const assistantBubble = (panel, text = "") => {
  const d = document.createElement("div");
  d.className = "assistant-message";
  d.innerHTML = `
    <img class="avatar"
         src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/assistant_icon.png">
    <div class="assistant-content">${text}</div>`;
  panel.appendChild(d);
  const content = d.querySelector(".assistant-content");
  addCopy(content);
  scrollBottom(panel);
  return content;
};

export const thinking = () => {
  const s = document.createElement("span");
  s.className = "thinking-container";
  s.innerHTML =
    '<span class="thinking-indicator"></span><span>Sto pensando…</span>';
  return s;
};

/* ---------- session helpers --------------------------------------- */
// ⬇️ keep sessions sorted (newest → oldest)
export const setSessions = arr => {
  sessions = [...arr].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
};
export const getSessions = ()  => sessions;
export const currentId   = ()  => current;

export async function loadHistory(id, panel, titleNode, fetchHist) {
  current = id;
  titleNode.textContent =
    (sessions.find(s => s.sessionId === id) || {}).title ||
    "Assistente AI - Comune di Perugia";
  panel.innerHTML = "";
  (await fetchHist(id)).forEach(m =>
    m.role === "user"
      ? userBubble(panel, m.content)
      : assistantBubble(panel, m.content)
  );
}

export function buildRecents(listEl, click) {
  listEl.innerHTML = "";
  sessions.forEach(meta => {
    const d   = document.createElement("div");
    d.className = "recent-item";
    d.onclick   = () => click(meta.sessionId);
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
