// src/components/ChatMessages.js
import { scrollBottom } from "../utils/scrollBottom.js";

// user bubble
export function userBubble(panel, text) {
  const d = document.createElement("div");
  d.className = "user-message";
  d.innerHTML = `
    <div class="user-text">${text}</div>
    <img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/usericon_1.png"
         style="width:35px;height:35px;border-radius:5px">`;
  panel.appendChild(d);
  scrollBottom(panel);
}

// copy‐button helper
function addCopy(wrap) {
  const controls = document.createElement("div");
  controls.className = "assistant-controls";
  controls.innerHTML = `
    <span class="tooltiptext">Copia</span>
    <button>
      <img class="copy-btn-img"
           src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/copyicon.png">
    </button>`;
  wrap.parentNode.appendChild(controls);

  const tip = controls.querySelector(".tooltiptext");
  controls.querySelector("button")
    .addEventListener("click", e => {
      e.stopPropagation();
      navigator.clipboard.writeText(wrap.textContent || "");
      tip.textContent = "Copiato";
      setTimeout(() => (tip.textContent = "Copia"), 1500);
    });
}

// assistant bubble
export function assistantBubble(panel, text = "") {
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
}

// thinking indicator
export function thinking() {
  const s = document.createElement("span");
  s.className = "thinking-container";
  s.innerHTML =
    '<span class="thinking-indicator"></span><span>Sto pensando…</span>';
  return s;
}
