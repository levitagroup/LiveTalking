// src/avatar/config.js
export const AVATAR_PORT   = 8010;
export const AVATAR_ORIGIN = `${window.location.protocol}//${window.location.hostname}:${AVATAR_PORT}`;

export const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:6.tcp.eu.ngrok.io:14097?transport=tcp",
    username: "myturnuser",
    credential: "mypassword"
  }
];
