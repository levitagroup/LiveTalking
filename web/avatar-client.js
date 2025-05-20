// avatar-client.js
// --------------------------------------------------
// • Chroma-key “green screen” on the live avatar
// • Canvas covers 100% × 100% of container
// • Always fetch /offer & /human on port 8010
// • Forces raw video autoplay when tracks arrive
// --------------------------------------------------

(async () => {
  // 1) Wait for DOM ready
  if (document.readyState === "loading") {
    await new Promise(r =>
      document.addEventListener("DOMContentLoaded", r, { once: true })
    );
  }

  // 2) Hidden <video> for raw WebRTC stream
  const rawVideo = document.createElement("video");
  rawVideo.autoplay    = true;
  rawVideo.playsInline = true;
  rawVideo.muted       = true;    // needed for autoplay
  rawVideo.style.display = "none";
  document.body.appendChild(rawVideo);

  // 3) Canvas for chroma-key output
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

  // 4) Hidden <audio> for TTS
  const audioEl = new Audio();
  audioEl.autoplay = true;
  audioEl.volume   = 1.0;
  audioEl.muted    = false;

  // 5) WebRTC negotiation
  const AVATAR_PORT = 8010;
  const AVATAR_ORIGIN = `${window.location.protocol}//${window.location.hostname}:${AVATAR_PORT}`;

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:6.tcp.eu.ngrok.io:14097?transport=tcp",
        username: "myturnuser",
        credential: "mypassword"
      }
    ]
  });
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  const remoteStream = new MediaStream();
  rawVideo.srcObject = remoteStream;
  audioEl.srcObject  = remoteStream;
  pc.ontrack = e => remoteStream.addTrack(e.track);

  // offer → ICE → POST /offer
  await pc.setLocalDescription(await pc.createOffer());
  await new Promise(r => {
    pc.onicecandidate = ev => { if (!ev.candidate) r(); };
    setTimeout(r, 2000);
  });

  const offerRes = await fetch(`${AVATAR_ORIGIN}/offer`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      sdp:  pc.localDescription.sdp,
      type: pc.localDescription.type
    })
  });
  if (!offerRes.ok) {
    console.error("Failed to call /offer:", offerRes.status, await offerRes.text());
    return;
  }
  const { sdp, type, sessionid } = await offerRes.json();
  await pc.setRemoteDescription({ sdp, type });

  // force raw video to play
  rawVideo.play().catch(() => {});
  console.log("🗣️ Avatar WebRTC ready (session:", sessionid, ")");

  // 6) Chroma-key processing loop
  const ctx = canvas.getContext("2d");
  function processFrame() {
    if (rawVideo.videoWidth > 0) {
      if (
        canvas.width !== rawVideo.videoWidth ||
        canvas.height !== rawVideo.videoHeight
      ) {
        canvas.width  = rawVideo.videoWidth;
        canvas.height = rawVideo.videoHeight;
      }
      ctx.drawImage(rawVideo, 0, 0);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px    = frame.data;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i+1], b = px[i+2];
        if (g > 150 && g > r + 30 && g > b + 30) {
          px[i+3] = 0;
        }
      }
      ctx.putImageData(frame, 0, 0);
    }
    requestAnimationFrame(processFrame);
  }

  // 7) Inject into #chat-container
  function injectToContainer(container) {
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    if (!container.contains(canvas)) {
      container.prepend(canvas);
    }
    requestAnimationFrame(processFrame);
  }

  // 8) Observe new chat containers
  new MutationObserver(muts => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.id === "chat-container") {
          injectToContainer(node);
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // 9) Inject immediately if already present
  const existing = document.getElementById("chat-container");
  if (existing) injectToContainer(existing);

  // 10) Expose speakAvatar → POST /human
  window.speakAvatar = async text => {
    const humanRes = await fetch(`${AVATAR_ORIGIN}/human`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        sessionid,
        type:      "echo",
        interrupt: true,
        text
      })
    });
    if (!humanRes.ok) {
      console.error("Failed to call /human:", humanRes.status, await humanRes.text());
    }
    audioEl.play().catch(() => {});
  };
})();
