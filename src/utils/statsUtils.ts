import { GroupStats } from "../types/types"; // Assicurati che questo import sia corretto e che il tipo GroupStats esista

/**
 * Inizializza le statistiche per un gruppo specificato dall'ID della chat.
 * Questa funzione imposta tutti i contatori delle statistiche a zero per il gruppo designato.
 *
 * @param chatId - L'ID univoco della chat del gruppo per il quale inizializzare le statistiche.
 * @param groupStats - Un oggetto che mappa gli ID delle chat ai dati delle statistiche del gruppo.
 *
 * @returns {void} - Non restituisce nulla; modifica direttamente l'oggetto `groupStats` passato per riferimento.
 */
const initializeGroupStats = (
  chatId: string,
  groupStats: Record<string, GroupStats>
): void => {
  // Verifica se le statistiche del gruppo per il chatId esistono già, se sì, resetta i valori
  groupStats[chatId] = {
    totalMessages: 0, // Numero totale di messaggi nel gruppo
    totalSizeKB: 0, // Dimensione totale dei messaggi in kilobyte
    textTotalMessages: 0, // Numero totale di messaggi di testo
    textTotalSize: 0, // Dimensione totale dei messaggi di testo in kilobyte
    photoTotalMessages: 0, // Numero totale di messaggi contenenti foto
    photoTotalSize: 0, // Dimensione totale delle foto in kilobyte
    videoTotalMessages: 0, // Numero totale di messaggi contenenti video
    videoTotalSize: 0, // Dimensione totale dei video in kilobyte
    documentTotalMessages: 0, // Numero totale di messaggi contenenti documenti
    documentTotalSize: 0, // Dimensione totale dei documenti in kilobyte
    pollTotalMessages: 0, // Numero totale di messaggi di tipo sondaggio
    pollTotalSize: 0, // Dimensione totale dei sondaggi in kilobyte
    stickerTotalMessages: 0, // Numero totale di messaggi contenenti adesivi
    stickerTotalSize: 0, // Dimensione totale degli adesivi in kilobyte
    voiceTotalMessages: 0, // Numero totale di messaggi vocali
    voiceTotalSize: 0, // Dimensione totale dei messaggi vocali in kilobyte
  };
};

export { initializeGroupStats };
