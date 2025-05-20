// src/avatar/elements.js

export function createRawVideo() {
    const video = document.createElement("video");
    video.autoplay    = true;
    video.playsInline = true;
    video.muted       = true;    // needed for autoplay
    video.style.display = "none";
    document.body.appendChild(video);
    return video;
  }
  
  export function createCanvas() {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position:      "absolute",
      top:           "100px",
      left:          "0",
      width:         "100%",
      height:        "100%",
      objectFit:     "cover",
      zIndex:        "0",
      pointerEvents: "none"
    });
    return canvas;
  }
  
  export function createAudioElement() {
    const audio = new Audio();
    audio.autoplay = true;
    audio.volume   = 1.0;
    audio.muted    = false;
    return audio;
  }
  