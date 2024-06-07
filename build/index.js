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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();
const axios = require("axios");
const cron = require("node-cron");
const { Telegraf, Context } = require("telegraf");
const { co2 } = require("@tgwf/co2");
const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });
const bot = new Telegraf(process.env.BOT_TOKEN);
const getKbSize_1 = require("./utils/getKbSize");
const getMemberCount_1 = require("./utils/getMemberCount");
let groupStats = {};
const initializeGroupStats = (chatId) => {
    groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};
bot.start((ctx) => ctx.reply("Benvenuto!!!!!! Usa /help per visualizzare l'elenco dei comandi."));
bot.help((ctx) => ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo"));
bot.command("stats", (ctx) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId && groupStats[chatId]) {
        const stats = groupStats[chatId];
        ctx.reply(`Statistiche del gruppo - ultimo frame non ancora report finito :\nMessaggi totali: ${stats.totalMessages}\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`);
    }
    else {
        ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
    }
});
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    const chatType = (_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.type;
    if (!groupStats[chatId] && chatType === "supergroup") {
        initializeGroupStats(chatId);
    }
    // Check if the bot is still an administrator
    const isAdmin = yield isBotAdmin(ctx);
    if (isAdmin && groupStats[chatId]) {
        groupStats[chatId].totalMessages++;
        const messageSizeKB = parseFloat((0, getKbSize_1.calculateMessageSizeKB)(ctx.message).toString());
        groupStats[chatId].totalSizeKB += messageSizeKB;
    }
    else {
        console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
    }
}));
// Function to check if the bot is still an administrator
const isBotAdmin = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
        const administrators = yield ctx.telegram.getChatAdministrators((_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.chat) === null || _f === void 0 ? void 0 : _f.id);
        const botId = ctx.botInfo.id;
        return administrators.some((admin) => admin.user.id === botId);
    }
    catch (error) {
        console.error("Errore durante il recupero degli amministratori:", error);
        return false;
    }
});
bot.launch();
app.get("/", (_req, res) => {
    res.send("Server is running and bot is active.");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${PORT}`);
    cron.schedule("*/15 * * * *", () => {
        console.log("Esecuzione del job di invio report ogni minuto !");
        if (Object.keys(groupStats).length > 0) {
            sendReport();
            groupStats = {}; // Clear the object after sending report
        }
        else {
            console.log("Nessun dato da inviare.");
        }
    });
}));
let endPoint = "http://localhost:3005";
if (process.env.ENVIRONMENT === "production") {
    endPoint = process.env.REPORT_ENDPOINT || "";
}
console.log("Endpoint:", endPoint);
const finalEndPoint = endPoint + "/api/v1/reports";
const sendEmptyReport = (chatId, chatInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!chatId) {
        console.error("Chat ID mancante.");
        return;
    }
    try {
        const payload = {
            groupId: chatId,
            totalMessages: 0,
            totalSizeKB: 0,
            emissionsOneByteMethod: 0,
            emissionsSWDMethod: 0,
            groupName: chatInfo.title,
            participantsCount: chatInfo.membersCount,
        };
        const response = yield axios.post(finalEndPoint, payload // Specifica il tipo di payload come ReportPayload
        );
    }
    catch (error) {
        console.log("Errore durante l'invio del report vuoto:", error);
    }
});
const sendReport = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const [chatId, stats] of Object.entries(groupStats)) {
        const totalSizeBytes = stats.totalSizeKB * 1024;
        const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
        const emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);
        // Ottieni il numero di partecipanti del gruppo
        const participantsCount = yield (0, getMemberCount_1.getParticipantsCount)(chatId);
        // Verifica se ci sono stati messaggi nel lasso di tempo del report
        let totalMessages = stats.totalMessages || 0;
        let totalSizeKB = stats.totalSizeKB || 0;
        let emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
            ? 0
            : parseFloat(emissionsOneByteMethod);
        let emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
            ? 0
            : parseFloat(emissionsSWDMethod);
        try {
            const chatInfo = yield bot.telegram.getChat(chatId);
            const payload = {
                groupId: chatId,
                totalMessages,
                totalSizeKB,
                emissionsOneByteMethod: emissionsOneByte,
                emissionsSWDMethod: emissionsSWD,
                groupName: chatInfo.title,
                participantsCount, // Aggiungi il numero di partecipanti al payload
            };
            const response = yield axios.post(finalEndPoint, payload // Specifica il tipo di payload come ReportPayload
            );
            // Azzeriamo solo i contatori dopo l'invio del report
            groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
        }
        catch (error) {
            if (error.response && error.response.status === 403) {
                console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
            }
            else {
                console.error("Errore durante l'invio del report :", error);
            }
        }
    }
    // Se non ci sono messaggi in nessun gruppo, invia report vuoto per ogni gruppo
    if (Object.keys(groupStats).length === 0) {
        const allChats = yield bot.telegram.getMyCommands();
        for (const chat of allChats) {
            const chatId = chat.chat.id;
            const chatInfo = yield bot.telegram.getChat(chatId);
            yield sendEmptyReport(chatId, chatInfo);
        }
    }
});
