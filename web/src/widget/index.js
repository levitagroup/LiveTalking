// src/widget/index.js

import {
    button,
    frame,
    head,
    main,
    userBubble,
    assistantBubble,
    setSessions,
    loadHistory,
    buildRecents,
    currentId,
    getSessions,
  } from "../ui/index.js";
  
  import {
    ensureAuth,
    listSessions,
    history,
    startSession,
    endSession,
    stream,
  } from "../services/index.js";
  
  import { scrollBottom } from "../utils/scrollBottom.js";
  import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
  
  const md2html = (md) => marked.parse(md);
  const sortByDateDesc = (arr) =>
    arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  async function refreshSessions(recentPane, recentList, switchCb) {
    const list = sortByDateDesc(await listSessions());
    setSessions(list);
    if (recentPane.style.display === "flex") {
      buildRecents(recentList, (sid) => {
        switchCb(sid);
        recentPane.style.display = "none";
      });
    }
  }
  
  export default async function initWidget() {
    // 1) Authenticate & seed sessions
    await ensureAuth();
    setSessions(sortByDateDesc(await listSessions()));
  
    let container = null;
    button().onclick = () => {
      if (container) {
        container.remove();
        container = null;
      } else {
        openWidget();
      }
    };
  
    async function openWidget() {
      container = frame();
      const H = head(container);
      const M = main(container);
  
      // ── Header controls ─────────────────────────────────────────────
      H.closeBtn.onclick = () => {
        container.remove();
        container = null;
      };
      H.menuBtn.onclick = (e) => {
        e.stopPropagation();
        H.menu.style.display =
          H.menu.style.display === "flex" ? "none" : "flex";
        H.menu.style.flexDirection = "column";
      };
      document.addEventListener("click", (ev) => {
        if (
          H.menu.style.display === "flex" &&
          !H.menu.contains(ev.target) &&
          !H.menuBtn.contains(ev.target)
        ) {
          H.menu.style.display = "none";
        }
      });
      H.newBtn.onclick = async () => {
        await startSession();
        await refreshSessions(
          H.recentPane,
          H.recentList,
          switchSession
        );
        switchSession(getSessions()[0].sessionId);
      };
      H.endBtn.onclick = async () => {
        const cur = currentId();
        if (cur) await endSession(cur);
        await refreshSessions(
          H.recentPane,
          H.recentList,
          switchSession
        );
        switchSession(
          getSessions()[0]?.sessionId ||
            (await startSession()).sessionId
        );
      };
      H.viewBtn.onclick = () => {
        buildRecents(H.recentList, (sid) => {
          switchSession(sid);
          H.recentPane.style.display = "none";
        });
        H.recentPane.style.display = "flex";
        H.menu.style.display = "none";
      };
      H.backRecent.onclick = () => {
        H.recentPane.style.display = "none";
      };
  
      // ── Listening‐waves setup ──────────────────────────────────────
      const BAR_COUNT = 30;
      M.waves.innerHTML = Array.from({ length: BAR_COUNT })
        .map(() => "<div></div>")
        .join("");
      M.waves.style.display = "none";
  
      let listening = false,
        recorder,
        audioChunks = [],
        audioCtx = null,
        analyser = null,
        dataArray = null,
        rafId = null;
  
      async function startAnalyser(stream) {
        audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = Math.pow(
          2,
          Math.ceil(Math.log2(BAR_COUNT * 2))
        );
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
  
        function updateWaves() {
          analyser.getByteFrequencyData(dataArray);
          M.waves.querySelectorAll("div").forEach((bar, i) => {
            const amp = dataArray[i] || 0;
            bar.style.height = `${(amp / 255) * 100}%`;
          });
          rafId = requestAnimationFrame(updateWaves);
        }
  
        M.waves.style.display = "flex";
        updateWaves();
      }
  
      function stopAnalyser() {
        if (rafId) cancelAnimationFrame(rafId);
        if (audioCtx) {
          audioCtx.close();
          audioCtx = analyser = dataArray = null;
        }
        M.waves.style.display = "none";
        M.waves.querySelectorAll("div").forEach((bar) => {
          bar.style.height = "0";
        });
      }
  
      // ── Record / mic button ───────────────────────────────────────
      M.recBtn.onclick = async () => {
        if (!listening) {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          recorder = new MediaRecorder(micStream);
          audioChunks = [];
          recorder.ondataavailable = (e) =>
            e.data.size && audioChunks.push(e.data);
          recorder.start();
          M.input.style.visibility = "hidden";
          M.sendBtn.style.visibility = "hidden";
          M.recBtn.textContent = "🛑";
          listening = true;
          startAnalyser(micStream);
        } else {
          recorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: "audio/webm" });
            const fd = new FormData();
            fd.append("audio", blob, "a.webm");
            const r = await fetch(
              "http://localhost:5001/api/transcribe_audio",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "apiToken"
                  )}`,
                },
                body: fd,
              }
            );
            const { recognized_text } = await r.json();
            if (recognized_text) send(recognized_text);
          };
          recorder.stop();
          M.input.style.visibility = "";
          M.sendBtn.style.visibility = "";
          M.recBtn.textContent = "🎤";
          listening = false;
          stopAnalyser();
        }
      };
  
      // ── TTS toggle ───────────────────────────────────────────────
      let ttsOn = false;
      M.ttsBtn.onclick = () => {
        ttsOn = !ttsOn;
        M.ttsBtn.textContent = ttsOn ? "🔊" : "🔇";
      };
  
      // ── Send / Stream ────────────────────────────────────────────
      const send = async (text) => {
        userBubble(M.panel, text);
        M.input.value = "";
  
        const wrap = assistantBubble(M.panel, "");
        const div = document.createElement("div");
        wrap.appendChild(div);
  
        const reader = await stream(currentId(), text);
        const dec = new TextDecoder();
        let md = "";
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          md += dec.decode(value, { stream: true });
          div.innerHTML = md2html(md);
          scrollBottom(M.panel);
        }
        wrap.dataset.mdRendered = "1";
  
        if (window.speakAvatar) window.speakAvatar(md);
        await refreshSessions(
          H.recentPane,
          H.recentList,
          switchSession
        );
      };
  
      M.sendBtn.onclick = () => {
        const v = M.input.value.trim();
        if (v) send(v);
      };
      M.input.onkeypress = (e) => {
        if (e.key === "Enter" && M.input.value.trim()) {
          send(M.input.value.trim());
        }
      };
  
      // ── Switch session ──────────────────────────────────────────
      async function switchSession(id) {
        await loadHistory(id, M.panel, H.title, history);
        M.panel
          .querySelectorAll(".assistant-content")
          .forEach((el) => {
            if (!el.dataset.mdRendered) {
              el.innerHTML = md2html(el.textContent.trim());
              el.dataset.mdRendered = "1";
            }
          });
        H.menu.style.display = "none";
        H.recentPane.style.display = "none";
      }
  
      // ── First session ───────────────────────────────────────────
      await refreshSessions(H.recentPane, H.recentList, switchSession);
      switchSession(
        getSessions()[0]?.sessionId ||
          (
            await startSession()
          ).sessionId
      );
    }
  }
  