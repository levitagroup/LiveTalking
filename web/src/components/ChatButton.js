// src/components/ChatButton.js
export default function ChatButton() {
    const d = document.createElement("div");
    d.className = "chat-button";
    d.innerHTML = `
      <img id="ai-button"
           src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/buttchat.png">`;
    document.body.appendChild(d);
    return d;
  }