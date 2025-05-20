// src/index.js

// 1) Inject the CSS
import "./styles/chat-widget.css";

// 2) Bootstrap the chat widget
import initWidget from "./widget/index.js";
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initWidget();
} else {
  document.addEventListener("DOMContentLoaded", initWidget, { once: true });
}

// 3) Load avatar‐client (already modularized under src/avatar)
import "./avatar/index.js";
