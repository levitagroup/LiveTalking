// src/services/auth.js
import { API_BASE, ID_KEY, TOKEN_KEY } from "./config.js";

let chatId = localStorage.getItem(ID_KEY);
if (!chatId) {
  chatId = Math.random().toString(36).substr(2, 10);
  localStorage.setItem(ID_KEY, chatId);
}

let token = localStorage.getItem(TOKEN_KEY) || null;

export function getChatId() {
  return chatId;
}

export function getToken() {
  return token;
}

export async function login() {
  const res = await fetch(`${API_BASE}/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId })
  });
  if (!res.ok) {
    throw new Error("Login failed");
  }
  const body = await res.json();
  token = body.access_token;
  localStorage.setItem(TOKEN_KEY, token);
}

export async function ensureAuth() {
  if (!token) {
    await login();
  }
}
