"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStats = void 0;
const updateStats = (chatId, messageSizeKB, typeOfMessage, groupStats) => {
    if (groupStats[chatId]) {
        // Aggiorna i contatori generali
        groupStats[chatId].totalMessages++;
        groupStats[chatId].totalSizeKB += messageSizeKB;
        // Usa uno switch per gestire i diversi tipi di messaggi
        switch (typeOfMessage) {
            case "text":
                groupStats[chatId].textTotalMessages++;
                groupStats[chatId].textTotalSize += messageSizeKB;
                break;
            case "photo":
                groupStats[chatId].photoTotalMessages++;
                groupStats[chatId].photoTotalSize += messageSizeKB;
                break;
            case "video":
                groupStats[chatId].videoTotalMessages++;
                groupStats[chatId].videoTotalSize += messageSizeKB;
                break;
            case "document":
                groupStats[chatId].documentTotalMessages++;
                groupStats[chatId].documentTotalSize += messageSizeKB;
                break;
            case "voice":
                groupStats[chatId].voiceTotalMessages++;
                groupStats[chatId].voiceTotalSize += messageSizeKB;
                break;
            case "poll":
                groupStats[chatId].pollTotalMessages++;
                groupStats[chatId].pollTotalSize += messageSizeKB;
                break;
            case "sticker":
                groupStats[chatId].stickerTotalMessages++;
                groupStats[chatId].stickerTotalSize += messageSizeKB;
                break;
            default:
                console.warn(`Tipo di messaggio sconosciuto: ${typeOfMessage}`);
                break;
        }
    }
};
exports.updateStats = updateStats;
