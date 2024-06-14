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
let groupLimits = {};
const initializeGroupStats = (chatId) => {
    groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};
bot.start((ctx) => ctx.reply("Benvenuto! Usa /help per visualizzare l'elenco dei comandi."));
bot.help((ctx) => ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo"));
// Function to check if the bot is still an administrator
const isBotAdmin = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const administrators = yield ctx.telegram.getChatAdministrators((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id);
        const botId = ctx.botInfo.id;
        return administrators.some((admin) => admin.user.id === botId);
    }
    catch (error) {
        console.error("Errore durante il recupero degli amministratori:", error);
        return false;
    }
});
const isUserAdmin = (ctx, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const administrators = yield ctx.telegram.getChatAdministrators((_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.id);
        return administrators.some((admin) => admin.user.id === userId);
    }
    catch (error) {
        console.error("Errore durante il recupero degli amministratori:", error);
        return false;
    }
});
bot.command("stats", (ctx) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId && groupStats[chatId]) {
        const stats = groupStats[chatId];
        ctx.reply(`Statistiche del gruppo - ultimo frame  :\nMessaggi totali: ${stats.totalMessages}\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`);
    }
    else {
        ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
    }
});
bot.command("set_limit", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j;
    const chatId = (_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.chat) === null || _f === void 0 ? void 0 : _f.id;
    const userId = (_h = (_g = ctx.message) === null || _g === void 0 ? void 0 : _g.from) === null || _h === void 0 ? void 0 : _h.id;
    if (chatId && userId) {
        const isAdmin = yield isUserAdmin(ctx, userId);
        if (isAdmin) {
            const limit = parseFloat((_j = ctx.message) === null || _j === void 0 ? void 0 : _j.text.split(" ")[1]);
            if (!isNaN(limit) && limit > 0) {
                groupLimits[chatId] = limit;
                ctx.reply(`Limite di dimensione del messaggio impostato a ${limit} KB.`);
            }
            else {
                ctx.reply("Per favore, fornisci un limite di dimensione valido (numero positivo).");
            }
        }
        else {
            ctx.reply("Solo gli amministratori possono impostare il limite di dimensione del messaggio.");
        }
    }
}));
bot.command("get_admins", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = ctx.message.chat.id;
    try {
        const admins = yield ctx.telegram.getChatAdministrators(chatId);
        ctx.reply(`Gli amministratori del gruppo sono: ${admins
            .map((admin) => admin.user.username)
            .join(", ")}`);
    }
    catch (error) {
        console.error("Errore durante il recupero degli amministratori:", error);
        ctx.reply("Si è verificato un errore durante il recupero degli amministratori.");
    }
}));
bot.command("get_limit", (ctx) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId && groupLimits[chatId] !== undefined) {
        ctx.reply(`Il limite di dimensione del messaggio è ${groupLimits[chatId]} KB.`);
    }
    else {
        ctx.reply("Non è stato impostato nessun limite di dimensione per questo gruppo.");
    }
});
bot.command("remove_limit", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m, _o;
    const chatId = (_l = (_k = ctx.message) === null || _k === void 0 ? void 0 : _k.chat) === null || _l === void 0 ? void 0 : _l.id;
    const userId = (_o = (_m = ctx.message) === null || _m === void 0 ? void 0 : _m.from) === null || _o === void 0 ? void 0 : _o.id;
    if (chatId && userId) {
        const isAdmin = yield isUserAdmin(ctx, userId);
        if (isAdmin) {
            if (groupLimits[chatId] !== undefined) {
                delete groupLimits[chatId];
                ctx.reply("Il limite di dimensione del messaggio è stato rimosso.");
            }
            else {
                ctx.reply("Non è stato impostato nessun limite di dimensione per questo gruppo.");
            }
        }
        else {
            ctx.reply("Solo gli amministratori possono rimuovere il limite di dimensione del messaggio.");
        }
    }
}));
// Middleware per gestire i messaggi in arrivo
bot.on("message", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s;
    const chatId = (_q = (_p = ctx.message) === null || _p === void 0 ? void 0 : _p.chat) === null || _q === void 0 ? void 0 : _q.id;
    const chatType = (_s = (_r = ctx.message) === null || _r === void 0 ? void 0 : _r.chat) === null || _s === void 0 ? void 0 : _s.type;
    if (!groupStats[chatId] && chatType === "supergroup") {
        initializeGroupStats(chatId);
    }
    const isAdmin = yield isBotAdmin(ctx);
    if (isAdmin && groupStats[chatId]) {
        const messageSizeKB = parseFloat((0, getKbSize_1.calculateMessageSizeKB)(ctx.message).toString());
        // Aggiornamento dei contatori
        updateStats(chatId, messageSizeKB);
        // Verifica del limite di dimensione e cancellazione del messaggio se necessario
        if (groupLimits[chatId] &&
            messageSizeKB > groupLimits[chatId]) {
            ctx.deleteMessage();
            ctx.reply("Il messaggio è stato rimosso perché supera il limite di dimensione impostato.");
        }
    }
    else {
        console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
    }
    next();
}));
// Funzione per aggiornare i contatori totalMessages e totalSizeKB
const updateStats = (chatId, messageSizeKB) => {
    if (groupStats[chatId]) {
        groupStats[chatId].totalMessages++;
        groupStats[chatId].totalSizeKB += messageSizeKB;
    }
};
bot.launch();
app.get("/", (_req, res) => {
    res.send("Server is running and bot is active add-limit-all-aws-get and remove limit.");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${PORT}`);
    cron.schedule("*/10 * * * *", () => {
        console.log("Esecuzione del job di invio report ogni 10 minuti !");
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
                console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso ?");
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
