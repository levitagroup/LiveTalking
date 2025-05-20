// src/services/http.js
import { login } from "./auth.js";
import { TOKEN_KEY } from "./config.js";

export async function req(url, opts = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  opts.headers ||= {};
  if (token) {
    opts.headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(url, opts);
  if (res.status === 401) {
    // try refreshing token once
    await login();
    const newToken = localStorage.getItem(TOKEN_KEY);
    opts.headers.Authorization = `Bearer ${newToken}`;
    res = await fetch(url, opts);
  }
  return res;
}
