// src/components/ChatContainer.js
export default function ChatContainer() {
    const c = document.createElement("div");
    c.id = "chat-container";
    document.body.appendChild(c);
    return c;
  }
  