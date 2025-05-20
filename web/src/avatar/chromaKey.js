// src/avatar/chromaKey.js
export function processFrame(rawVideo, canvas, ctx) {
    if (rawVideo.videoWidth === 0) return;
  
    if (
      canvas.width  !== rawVideo.videoWidth ||
      canvas.height !== rawVideo.videoHeight
    ) {
      canvas.width  = rawVideo.videoWidth;
      canvas.height = rawVideo.videoHeight;
    }
  
    ctx.drawImage(rawVideo, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = frame.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i+1], b = px[i+2];
      if (g > 150 && g > r + 30 && g > b + 30) {
        px[i+3] = 0;
      }
    }
    ctx.putImageData(frame, 0, 0);
  }
  