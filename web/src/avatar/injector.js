// src/avatar/injector.js
export function injectToContainer(container, canvas) {
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    if (!container.contains(canvas)) {
      container.prepend(canvas);
    }
  }
  