// src/avatar/observer.js
export function observeContainers(onAdd) {
    new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.id === "chat-container") {
            onAdd(node);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  