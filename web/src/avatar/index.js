// src/avatar/index.js
import { domReady }              from "./domReady.js";
import { createRawVideo,
         createCanvas,
         createAudioElement }    from "./elements.js";
import { setupWebRTC }           from "./webrtc.js";
import { processFrame }          from "./chromaKey.js";
import { injectToContainer }     from "./injector.js";
import { observeContainers }     from "./observer.js";
import { speakAvatar }           from "./tts.js";

(async function main() {
  await domReady();

  const rawVideo = createRawVideo();
  const canvas   = createCanvas();
  const audioEl  = createAudioElement();
  const ctx      = canvas.getContext("2d");

  const { sessionId } = await setupWebRTC(rawVideo, audioEl);

  function frameLoop() {
    processFrame(rawVideo, canvas, ctx);
    requestAnimationFrame(frameLoop);
  }

  function onContainer(container) {
    injectToContainer(container, canvas);
    frameLoop();
  }

  observeContainers(onContainer);

  // immediate injection if already present
  const existing = document.getElementById("chat-container");
  if (existing) onContainer(existing);

  // expose the TTS hook
  window.speakAvatar = text => speakAvatar(sessionId, audioEl, text);
})();
