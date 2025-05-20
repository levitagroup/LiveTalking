// src/utils/fmtAgo.js
export function fmtAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (mins < 1)    return "Ora";
    if (mins < 60)   return `${mins}m fa`;
    if (mins < 1440) return `${Math.floor(mins/60)}h fa`;
    return `${Math.floor(mins/1440)}g fa`;
  }
  