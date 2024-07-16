"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypemessages = void 0;
/**
 * Identifica e restituisce il tipo di messaggio basato sul contenuto dell'oggetto messaggio.
 * I messaggi di migrazione vengono esclusi dal processo di identificazione.
 *
 * @param message - L'oggetto del messaggio da cui determinare il tipo.
 * @returns {string} - Il tipo di messaggio identificato oppure un messaggio di errore se il tipo di messaggio non è supportato.
 */
const getTypemessages = (message) => {
    // Esclude i messaggi di migrazione da altre chat
    if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
        return ""; // I messaggi di migrazione non hanno un tipo di messaggio rilevante
    }
    // Identifica e restituisce il tipo di messaggio in base al contenuto
    if (message.text) {
        return "text"; // Messaggio di testo
    }
    else if (message.photo) {
        return "photo"; // Messaggio contenente una foto
    }
    else if (message.voice) {
        return "voice"; // Messaggio contenente una registrazione vocale
    }
    else if (message.video) {
        return "video"; // Messaggio contenente un video
    }
    else if (message.document) {
        return "document"; // Messaggio contenente un documento
    }
    else if (message.poll) {
        return "poll"; // Messaggio di tipo sondaggio
    }
    else if (message.sticker) {
        return "sticker"; // Messaggio contenente uno sticker
    }
    else {
        return "Tipo di messaggio non supportato"; // Tipo di messaggio sconosciuto
    }
};
exports.getTypemessages = getTypemessages;
