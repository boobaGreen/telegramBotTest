/**
 * Calcola la dimensione del messaggio in kilobyte (KB).
 * Questa funzione determina la dimensione del messaggio basandosi sul tipo di contenuto
 * e restituisce il valore in kilobyte con tre cifre decimali.
 * Se il messaggio è di tipo non supportato, restituisce un messaggio di errore.
 *
 * @param message - L'oggetto del messaggio contenente le proprietà che determinano il tipo e la dimensione del messaggio.
 * @returns {string} - La dimensione del messaggio in KB o un messaggio di errore se il tipo di messaggio non è supportato.
 */
export const calculateMessageSizeKB = (message: any): string => {
  // Ignora i messaggi di migrazione da un'altra chat
  if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
    return "0"; // I messaggi di migrazione non hanno una dimensione rilevante
  }

  // Calcola la dimensione del messaggio in base al suo tipo
  if (message.text) {
    // Calcola la dimensione del messaggio di testo
    const messageSizeBytes = Buffer.byteLength(message.text, "utf8");
    return (messageSizeBytes / 1024).toFixed(3); // Restituisce la dimensione in KB con tre cifre decimali
  } else if (message.photo) {
    // Calcola la dimensione dell'immagine
    const photoSizeBytes = message.photo[message.photo.length - 1].file_size;
    return (photoSizeBytes / 1024).toFixed(3); // Restituisce la dimensione in KB con tre cifre decimali
  } else if (message.voice) {
    // Calcola la dimensione del messaggio vocale
    const voiceSizeBytes = message.voice.file_size;
    return (voiceSizeBytes / 1024).toFixed(3); // Restituisce la dimensione in KB con tre cifre decimali
  } else if (message.video) {
    // Calcola la dimensione del video
    const videoSizeBytes = message.video.file_size;
    return (videoSizeBytes / 1024).toFixed(3); // Restituisce la dimensione in KB con tre cifre decimali
  } else if (message.document) {
    // Calcola la dimensione del documento
    const documentSizeBytes = message.document.file_size;
    return (documentSizeBytes / 1024).toFixed(3); // Restituisce la dimensione in KB con tre cifre decimali
  } else if (message.poll) {
    // Stima la dimensione dei messaggi di tipo sondaggio
    return "2.5"; // Valore stimato per i messaggi di tipo sondaggio (2.5 KB)
  } else if (message.sticker) {
    // Stima la dimensione dei messaggi di tipo sticker
    return "25"; // Valore stimato per i messaggi di tipo sticker (25 KB)
  } else {
    // Tipo di messaggio non supportato
    return "Tipo di messaggio non supportato";
  }
};
