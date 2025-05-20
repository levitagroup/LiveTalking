// src/utils/removeInfo.js
export function removeInformazioniAggiuntive(text) {
    // Matches from *** INFORMAZIONI AGGIUNTIVE *** through
    // *** FINE INFORMAZIONI AGGIUNTIVE ***, including newlines
    const pattern = /\*\*\* INFORMAZIONI AGGIUNTIVE \*\*\*[\s\S]*?\*\*\* FINE INFORMAZIONI AGGIUNTIVE \*\*\*/g;
    return text.replace(pattern, "");
  }
  