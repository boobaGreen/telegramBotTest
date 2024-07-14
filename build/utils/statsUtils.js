"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGroupStats = void 0;
/**
 * Inizializza le statistiche del gruppo per un determinato chatId.
 * @param chatId - L'ID della chat del gruppo.
 * @returns {GroupStats} - Oggetto con le statistiche inizializzate.
 */
const initializeGroupStats = (chatId) => {
    return {
        totalMessages: 0,
        totalSizeKB: 0,
        textTotalMessages: 0,
        textTotalSize: 0,
        photoTotalMessages: 0,
        photoTotalSize: 0,
        videoTotalMessages: 0,
        videoTotalSize: 0,
        documentTotalMessages: 0,
        documentTotalSize: 0,
        pollTotalMessages: 0,
        pollTotalSize: 0,
        stickerTotalMessages: 0,
        stickerTotalSize: 0,
        voiceTotalMessages: 0,
        voiceTotalSize: 0,
    };
};
exports.initializeGroupStats = initializeGroupStats;
