"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReport = exports.sendEmptyReport = void 0;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const axios_1 = __importDefault(require("axios"));
const { co2 } = require("@tgwf/co2");
// Inizializza i modelli CO2 per il calcolo delle emissioni
const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });
// Configura l'endpoint per l'invio dei report
let endPoint = "http://localhost:3005";
if (process.env.ENVIRONMENT === "production") {
    endPoint = process.env.REPORT_ENDPOINT || "";
}
const finalEndPoint = endPoint + "/api/v1/reports";
/**
 * Invia i dati del report all'endpoint configurato.
 * Questa funzione gestisce l'invio dei dati del report al server tramite una richiesta HTTP POST.
 *
 * @param payload - I dati del report da inviare, strutturati come `ReportPayload`.
 *
 * @returns {Promise<void>} - Una promessa che si risolve quando l'invio è completato, oppure viene rigettata in caso di errore.
 */
const sendReportData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("payload :", payload);
    try {
        const response = yield axios_1.default.post(finalEndPoint, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-Custom-Origin": "supersegretissimo",
            },
        });
        console.log(`Report inviato per il gruppo ${payload.groupId}:`, response.data);
    }
    catch (error) {
        console.error(`Errore durante l'invio del report per il gruppo ${payload.groupId}:`, error);
    }
});
// Crea il payload del report con i dati aggregati e le emissioni calcolate
const createReportPayload = (chatId, stats, groupName = "", participantsCount = 0, adminIds = []) => {
    // Calcola la dimensione totale e le emissioni per ogni tipo di messaggio
    const totalSizeBytes = stats.totalSizeKB * 1024;
    const textTotalSizeBytes = stats.textTotalSize * 1024;
    const photoTotalSizeBytes = stats.photoTotalSize * 1024;
    const videoTotalSizeBytes = stats.videoTotalSize * 1024;
    const documentTotalSizeBytes = stats.documentTotalSize * 1024;
    const voiceTotalSizeBytes = stats.voiceTotalSize * 1024;
    const stickerTotalSizeBytes = stats.stickerTotalSize * 1024;
    const pollTotalSizeBytes = stats.pollTotalSize * 1024;
    // Calcola le emissioni di CO2 utilizzando due metodi
    const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
    const emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);
    const textEmissionsOneByteMethod = oneByte
        .perByte(textTotalSizeBytes)
        .toFixed(7);
    const textEmissionsSWDMethod = swd.perByte(textTotalSizeBytes).toFixed(7);
    const photoEmissionsOneByteMethod = oneByte
        .perByte(photoTotalSizeBytes)
        .toFixed(7);
    const photoEmissionsSWDMethod = swd.perByte(photoTotalSizeBytes).toFixed(7);
    const videoEmissionsOneByteMethod = oneByte
        .perByte(videoTotalSizeBytes)
        .toFixed(7);
    const videoEmissionsSWDMethod = swd.perByte(videoTotalSizeBytes).toFixed(7);
    const documentEmissionsOneByteMethod = oneByte
        .perByte(documentTotalSizeBytes)
        .toFixed(7);
    const documentEmissionsSWDMethod = swd
        .perByte(documentTotalSizeBytes)
        .toFixed(7);
    const voiceEmissionsOneByteMethod = oneByte
        .perByte(voiceTotalSizeBytes)
        .toFixed(7);
    const voiceEmissionsSWDMethod = swd.perByte(voiceTotalSizeBytes).toFixed(7);
    const stickerEmissionsOneByteMethod = oneByte
        .perByte(stickerTotalSizeBytes)
        .toFixed(7);
    const stickerEmissionsSWDMethod = swd
        .perByte(stickerTotalSizeBytes)
        .toFixed(7);
    const pollEmissionsOneByteMethod = oneByte
        .perByte(pollTotalSizeBytes)
        .toFixed(7);
    const pollEmissionsSWDMethod = swd.perByte(pollTotalSizeBytes).toFixed(7);
    // Gestisce i valori mancanti e restituisce il payload del report
    let totalMessages = stats.totalMessages || 0;
    let totalSizeKB = stats.totalSizeKB || 0;
    let emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
        ? 0
        : parseFloat(emissionsOneByteMethod);
    let emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
        ? 0
        : parseFloat(emissionsSWDMethod);
    let textTotalMessages = stats.textTotalMessages || 0;
    let textTotalSize = stats.textTotalSize || 0;
    let textEmissionsOneByte = isNaN(parseFloat(textEmissionsOneByteMethod))
        ? 0
        : parseFloat(textEmissionsOneByteMethod);
    let textEmissionsSWD = isNaN(parseFloat(textEmissionsSWDMethod))
        ? 0
        : parseFloat(textEmissionsSWDMethod);
    let photoTotalMessages = stats.photoTotalMessages || 0;
    let photoTotalSize = stats.photoTotalSize || 0;
    let photoEmissionsOneByte = isNaN(parseFloat(photoEmissionsOneByteMethod))
        ? 0
        : parseFloat(photoEmissionsOneByteMethod);
    let photoEmissionsSWD = isNaN(parseFloat(photoEmissionsSWDMethod))
        ? 0
        : parseFloat(photoEmissionsSWDMethod);
    let videoTotalMessages = stats.videoTotalMessages || 0;
    let videoTotalSize = stats.videoTotalSize || 0;
    let videoEmissionsOneByte = isNaN(parseFloat(videoEmissionsOneByteMethod))
        ? 0
        : parseFloat(videoEmissionsOneByteMethod);
    let videoEmissionsSWD = isNaN(parseFloat(videoEmissionsSWDMethod))
        ? 0
        : parseFloat(videoEmissionsSWDMethod);
    let documentTotalMessages = stats.documentTotalMessages || 0;
    let documentTotalSize = stats.documentTotalSize || 0;
    let documentEmissionsOneByte = isNaN(parseFloat(documentEmissionsOneByteMethod))
        ? 0
        : parseFloat(documentEmissionsOneByteMethod);
    let documentEmissionsSWD = isNaN(parseFloat(documentEmissionsSWDMethod))
        ? 0
        : parseFloat(documentEmissionsSWDMethod);
    let pollTotalMessages = stats.pollTotalMessages || 0;
    let pollTotalSize = stats.pollTotalSize || 0;
    let pollEmissionsOneByte = isNaN(parseFloat(pollEmissionsOneByteMethod))
        ? 0
        : parseFloat(pollEmissionsOneByteMethod);
    let pollEmissionsSWD = isNaN(parseFloat(pollEmissionsSWDMethod))
        ? 0
        : parseFloat(pollEmissionsSWDMethod);
    let stickerTotalMessages = stats.stickerTotalMessages || 0;
    let stickerTotalSize = stats.stickerTotalSize || 0;
    let stickerEmissionsOneByte = isNaN(parseFloat(stickerEmissionsOneByteMethod))
        ? 0
        : parseFloat(stickerEmissionsOneByteMethod);
    let stickerEmissionsSWD = isNaN(parseFloat(stickerEmissionsSWDMethod))
        ? 0
        : parseFloat(stickerEmissionsSWDMethod);
    let voiceTotalMessages = stats.voiceTotalMessages || 0;
    let voiceTotalSize = stats.voiceTotalSize || 0;
    let voiceEmissionsOneByte = isNaN(parseFloat(voiceEmissionsOneByteMethod))
        ? 0
        : parseFloat(voiceEmissionsOneByteMethod);
    let voiceEmissionsSWD = isNaN(parseFloat(voiceEmissionsSWDMethod))
        ? 0
        : parseFloat(voiceEmissionsSWDMethod);
    return {
        groupId: chatId,
        totalMessages: totalMessages,
        totalSizeKB: totalSizeKB,
        emissionsOneByteMethod: emissionsOneByte,
        emissionsSWDMethod: emissionsSWD,
        textTotalMessages,
        textTotalSize,
        textEmissionsOneByteMethod: textEmissionsOneByte,
        textEmissionsSWDMethod: textEmissionsSWD,
        photoTotalMessages,
        photoTotalSize,
        photoEmissionsOneByteMethod: photoEmissionsOneByte,
        photoEmissionsSWDMethod: photoEmissionsSWD,
        videoTotalMessages,
        videoTotalSize,
        videoEmissionsOneByteMethod: videoEmissionsOneByte,
        videoEmissionsSWDMethod: videoEmissionsSWD,
        voiceTotalMessages: voiceTotalMessages,
        voiceTotalSize: voiceTotalSize,
        voiceEmissionsOneByteMethod: voiceEmissionsOneByte,
        voiceEmissionsSWDMethod: voiceEmissionsSWD,
        documentTotalMessages,
        documentTotalSize,
        documentEmissionsOneByteMethod: documentEmissionsOneByte,
        documentEmissionsSWDMethod: documentEmissionsSWD,
        pollTotalMessages,
        pollTotalSize,
        pollEmissionsOneByteMethod: pollEmissionsOneByte,
        pollEmissionsSWDMethod: pollEmissionsSWD,
        stickerTotalMessages,
        stickerTotalSize,
        stickerEmissionsOneByteMethod: stickerEmissionsOneByte,
        stickerEmissionsSWDMethod: stickerEmissionsSWD,
        groupName: groupName,
        participantsCount, // Aggiunge il numero di partecipanti al payload
        adminIds, // Aggiunge gli ID degli amministratori al payload
    };
};
// Invia un report vuoto per un gruppo specificato
const sendEmptyReport = (chatId, chatInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = createReportPayload(chatId, {
        totalMessages: 0,
        totalSizeKB: 0,
        textTotalMessages: 0,
        textTotalSize: 0,
        photoTotalMessages: 0,
        photoTotalSize: 0,
        videoTotalMessages: 0,
        videoTotalSize: 0,
        voiceTotalMessages: 0,
        voiceTotalSize: 0,
        documentTotalMessages: 0,
        documentTotalSize: 0,
        pollTotalMessages: 0,
        pollTotalSize: 0,
        stickerTotalMessages: 0,
        stickerTotalSize: 0,
    }, chatInfo.title || "", chatInfo.membersCount || 0, []);
    console.log("payload poco prima di spedire vuoto", payload);
    yield sendReportData(payload);
});
exports.sendEmptyReport = sendEmptyReport;
// Invia report per tutti i gruppi e azzera i contatori dopo l'invio
const sendReport = (groupStats, chatInfos) => __awaiter(void 0, void 0, void 0, function* () {
    for (const chatId in groupStats) {
        const stats = groupStats[chatId];
        const chatInfo = chatInfos[chatId] || {};
        const payload = createReportPayload(chatId, stats, chatInfo.title || "", chatInfo.membersCount || 0, chatInfo.adminIds || []);
        yield sendReportData(payload);
        // Azzeramento dei contatori per il gruppo dopo l'invio del report
        groupStats[chatId] = {
            totalMessages: 0,
            totalSizeKB: 0,
            textTotalMessages: 0,
            textTotalSize: 0,
            photoTotalMessages: 0,
            photoTotalSize: 0,
            videoTotalMessages: 0,
            videoTotalSize: 0,
            voiceTotalMessages: 0,
            voiceTotalSize: 0,
            documentTotalMessages: 0,
            documentTotalSize: 0,
            pollTotalMessages: 0,
            pollTotalSize: 0,
            stickerTotalMessages: 0,
            stickerTotalSize: 0,
        };
    }
});
exports.sendReport = sendReport;
