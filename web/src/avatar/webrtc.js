// src/avatar/webrtc.js
import { AVATAR_ORIGIN, ICE_SERVERS } from "./config.js";

export async function setupWebRTC(rawVideo, audioEl) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  const remoteStream = new MediaStream();
  rawVideo.srcObject = remoteStream;
  audioEl.srcObject  = remoteStream;
  pc.ontrack = e => remoteStream.addTrack(e.track);

  // Offer → ICE gathering
  await pc.setLocalDescription(await pc.createOffer());
  await new Promise(r => {
    pc.onicecandidate = ev => { if (!ev.candidate) r(); };
    setTimeout(r, 2000);
  });

  // POST /offer
  const offerRes = await fetch(`${AVATAR_ORIGIN}/offer`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      sdp:  pc.localDescription.sdp,
      type: pc.localDescription.type
    })
  });
  if (!offerRes.ok) {
    throw new Error(`Avatar /offer failed: ${offerRes.status}`);
  }
  const { sdp, type, sessionid } = await offerRes.json();
  await pc.setRemoteDescription({ sdp, type });

  // Start playback
  rawVideo.play().catch(() => {});
  console.log("🗣️ Avatar WebRTC ready (session:", sessionid, ")");

  return { sessionId: sessionid, remoteStream };
}
