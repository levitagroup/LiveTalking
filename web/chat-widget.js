(() => {
  // 1) Load chat widget CSS
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "chat-widget.css";
  document.head.appendChild(link);

  // 2) Boot the chat widget
  const run = () =>
    import("./src/widget-main.js").catch(err =>
      console.error("PG chat-widget failed to load:", err)
    );

  if (document.readyState === "complete" || document.readyState === "interactive") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run, { once:true });
  }

  // 3) Load our avatar-client logic
  const script = document.createElement("script");
  script.src = "avatar-client.js";  // must live next to this file
  document.body.appendChild(script);
})();
