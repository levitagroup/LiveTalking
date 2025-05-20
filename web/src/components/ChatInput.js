// src/components/ChatInput.js
export default function ChatInput(root) {
    const panel = document.createElement("div");
    panel.id = "chat-messages";
    root.appendChild(panel);
  
    const box = document.createElement("div");
    box.id = "chat-input-container";
  
    // you'll want to parameterize BAR_COUNT later;
    // for now we mirror the original 5 bars here
    const BAR_COUNT = 5;
    box.innerHTML = `
      <input id="chat-input" type="text"
             placeholder="Scrivi qui il tuo messaggio…">
      <div class="listening-waves">
        ${"<div></div>".repeat(BAR_COUNT)}
      </div>
      <div id="chat-buttons-container">
        <div id="audio-buttons-container">
          <button class="control-button" id="recBtn">🎤</button>
          <button class="control-button" style="display: none;"
                  id="ttsBtn">🔇</button>
        </div>
        <button class="send-button" id="sendBtn">
          <img src="https://giorgio.levitagroup.com/wp-content/uploads/2025/04/RedSendIcon.png"
               width="40" height="35">
        </button>
      </div>`;
    root.appendChild(box);
  
    return {
      panel,
      input   : box.querySelector("#chat-input"),
      waves   : box.querySelector(".listening-waves"),
      recBtn  : box.querySelector("#recBtn"),
      ttsBtn  : box.querySelector("#ttsBtn"),
      sendBtn : box.querySelector("#sendBtn")
    };
  }
  