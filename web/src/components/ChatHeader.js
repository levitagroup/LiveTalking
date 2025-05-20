// src/components/ChatHeader.js
export default function ChatHeader(root) {
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
               class="back-btn">
          <span>Chat recenti</span>
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
  }
  