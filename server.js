var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var _this = this;
require("dotenv").config();
var express = require("express");
var _a = require("telegraf"), Telegraf = _a.Telegraf, Context = _a.Context;
var co2 = require("@tgwf/co2").co2;
var oneByte = new co2({ model: "1byte" });
var swd = new co2({ model: "swd" });
var axios = require("axios");
var cron = require("node-cron");
var app = express();
var bot = new Telegraf(process.env.BOT_TOKEN);
var getParticipantsCount = function (chatId) { return __awaiter(_this, void 0, void 0, function () {
    var response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios.get("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/getChatMembersCount?chat_id=").concat(chatId))];
            case 1:
                response = _a.sent();
                console.log("Risposta dal recupero del numero di partecipanti:", response);
                return [2 /*return*/, response.data.result];
            case 2:
                error_1 = _a.sent();
                console.error("Errore durante il recupero del numero di partecipanti:", error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
var groupStats = {};
var initializeGroupStats = function (chatId) {
    groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};
var calculateMessageSizeKB = function (message) {
    // Controlla se il messaggio è una migrazione da un altro chat
    if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
        return 0; // Ignora i messaggi di migrazione
    }
    // Controlla il tipo di messaggio
    if (message.text) {
        var messageSizeBytes = Buffer.byteLength(message.text, "utf8");
        return (messageSizeBytes / 1024).toFixed(3);
    }
    else if (message.photo) {
        var photoSizeBytes = message.photo[message.photo.length - 1].file_size;
        return (photoSizeBytes / 1024).toFixed(3);
    }
    else if (message.voice) {
        var voiceSizeBytes = message.voice.file_size;
        return (voiceSizeBytes / 1024).toFixed(3);
    }
    else if (message.video) {
        var videoSizeBytes = message.video.file_size;
        return (videoSizeBytes / 1024).toFixed(3);
    }
    else if (message.document) {
        var documentSizeBytes = message.document.file_size;
        return (documentSizeBytes / 1024).toFixed(3);
    }
    else if (message.poll) {
        // Gestisci i messaggi di tipo poll
        return "2.5"; // Imposta un valore minimo per i poll (2.5 KB, media tra 2 e 5 KB)
    }
    else if (message.sticker) {
        // Gestisci i messaggi di tipo sticker
        return "25"; // Imposta un valore fisso per gli sticker (25 KB, media tra 20 e 30 KB)
    }
    else {
        return "Tipo di messaggio non supportato";
    }
};
console.log("Bot started");
bot.start(function (ctx) {
    return ctx.reply("Benvenuto! Usa /help per visualizzare l'elenco dei comandi.");
});
bot.help(function (ctx) {
    return ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo");
});
bot.command("stats", function (ctx) {
    var _a, _b;
    var chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId && groupStats[chatId]) {
        var stats = groupStats[chatId];
        ctx.reply("Statistiche del gruppo:\nMessaggi totali: ".concat(stats.totalMessages, "\nDimensione totale: ").concat(stats.totalSizeKB.toFixed(3), " KB"));
    }
    else {
        ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
    }
});
bot.on("message", function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, chatType, messageSizeKB;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
        chatType = (_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.type;
        if (chatType === "supergroup" &&
            ((_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.chat) === null || _f === void 0 ? void 0 : _f.all_members_are_administrators) === false) {
            console.log("Il bot \u00E8 stato rimosso dal gruppo super con ID ".concat(chatId));
            return [2 /*return*/];
        }
        if (!groupStats[chatId] && chatType === "supergroup") {
            initializeGroupStats(chatId);
        }
        if (groupStats[chatId]) {
            groupStats[chatId].totalMessages++;
            messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message).toString());
            groupStats[chatId].totalSizeKB += messageSizeKB;
        }
        else {
            console.log("Il gruppo con ID ".concat(chatId, " non \u00E8 stato inizializzato."));
        }
        return [2 /*return*/];
    });
}); });
bot.launch();
app.get("/", function (_req, res) {
    res.send("Server is running and bot is active.");
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Server is running on port ".concat(PORT));
        cron.schedule("* * * * *", function () {
            console.log("Esecuzione del job di invio report ogni minuto !");
            if (Object.keys(groupStats).length > 0) {
                sendReport();
                groupStats = {}; // Clear the object after sending report
            }
            else {
                console.log("Nessun dato da inviare.");
            }
        });
        return [2 /*return*/];
    });
}); });
var sendEmptyReport = function (chatId, chatInfo) { return __awaiter(_this, void 0, void 0, function () {
    var payload, reportEndpoint, response, error_2, express_1, _a, Telegraf_1, Context_1, co2_1, oneByte_1, swd_1, axios_1, cron_1, app_1, bot_1, getParticipantsCount_1, groupStats_1, initializeGroupStats_1, calculateMessageSizeKB_1, PORT_1, sendEmptyReport_1, sendReport_1;
    var _this = this;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!chatId) {
                    console.error("Chat ID mancante.");
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                payload = {
                    groupId: chatId,
                    totalMessages: 0,
                    totalSizeKB: 0,
                    emissionsOneByteMethod: 0,
                    emissionsSWDMethod: 0,
                    groupName: chatInfo.title,
                    participantsCount: chatInfo.membersCount,
                };
                reportEndpoint = process.env.REPORT_ENDPOINT || "http://localhost:3005/api/v1/reports";
                return [4 /*yield*/, axios.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                    )];
            case 2:
                response = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                if (error_2.response && error_2.response.status === 403) {
                    require("dotenv").config();
                    express_1 = require("express");
                    _a = require("telegraf"), Telegraf_1 = _a.Telegraf, Context_1 = _a.Context;
                    co2_1 = require("@tgwf/co2").co2;
                    oneByte_1 = new co2_1({ model: "1byte" });
                    swd_1 = new co2_1({ model: "swd" });
                    axios_1 = require("axios");
                    cron_1 = require("node-cron");
                    app_1 = express_1();
                    bot_1 = new Telegraf_1(process.env.BOT_TOKEN);
                    getParticipantsCount_1 = function (chatId) { return __awaiter(_this, void 0, void 0, function () {
                        var response, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, axios_1.get("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/getChatMembersCount?chat_id=").concat(chatId))];
                                case 1:
                                    response = _a.sent();
                                    console.log("Risposta dal recupero del numero di partecipanti:", response);
                                    return [2 /*return*/, response.data.result];
                                case 2:
                                    error_3 = _a.sent();
                                    console.error("Errore durante il recupero del numero di partecipanti:", error_3);
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    groupStats_1 = {};
                    initializeGroupStats_1 = function (chatId) {
                        groupStats_1[chatId] = { totalMessages: 0, totalSizeKB: 0 };
                    };
                    calculateMessageSizeKB_1 = function (message) {
                        // Controlla se il messaggio è una migrazione da un altro chat
                        if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
                            return 0; // Ignora i messaggi di migrazione
                        }
                        // Controlla il tipo di messaggio
                        if (message.text) {
                            var messageSizeBytes = Buffer.byteLength(message.text, "utf8");
                            return (messageSizeBytes / 1024).toFixed(3);
                        }
                        else if (message.photo) {
                            var photoSizeBytes = message.photo[message.photo.length - 1].file_size;
                            return (photoSizeBytes / 1024).toFixed(3);
                        }
                        else if (message.voice) {
                            var voiceSizeBytes = message.voice.file_size;
                            return (voiceSizeBytes / 1024).toFixed(3);
                        }
                        else if (message.video) {
                            var videoSizeBytes = message.video.file_size;
                            return (videoSizeBytes / 1024).toFixed(3);
                        }
                        else if (message.document) {
                            var documentSizeBytes = message.document.file_size;
                            return (documentSizeBytes / 1024).toFixed(3);
                        }
                        else if (message.poll) {
                            // Gestisci i messaggi di tipo poll
                            return "2.5"; // Imposta un valore minimo per i poll (2.5 KB, media tra 2 e 5 KB)
                        }
                        else if (message.sticker) {
                            // Gestisci i messaggi di tipo sticker
                            return "25"; // Imposta un valore fisso per gli sticker (25 KB, media tra 20 e 30 KB)
                        }
                        else {
                            return "Tipo di messaggio non supportato";
                        }
                    };
                    console.log("Bot started");
                    bot_1.start(function (ctx) {
                        return ctx.reply("Benvenuto! Usa /help per visualizzare l'elenco dei comandi.");
                    });
                    bot_1.help(function (ctx) {
                        return ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo");
                    });
                    bot_1.command("stats", function (ctx) {
                        var _a, _b;
                        var chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
                        if (chatId && groupStats_1[chatId]) {
                            var stats = groupStats_1[chatId];
                            ctx.reply("Statistiche del gruppo:\nMessaggi totali: ".concat(stats.totalMessages, "\nDimensione totale: ").concat(stats.totalSizeKB.toFixed(3), " KB"));
                        }
                        else {
                            ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
                        }
                    });
                    bot_1.on("message", function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var chatId, chatType, messageSizeKB;
                        var _a, _b, _c, _d, _e, _f;
                        return __generator(this, function (_g) {
                            chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
                            chatType = (_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.type;
                            if (chatType === "supergroup" &&
                                ((_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.chat) === null || _f === void 0 ? void 0 : _f.all_members_are_administrators) === false) {
                                console.log("Il bot \u00E8 stato rimosso dal gruppo super con ID ".concat(chatId));
                                return [2 /*return*/];
                            }
                            if (!groupStats_1[chatId] && chatType === "supergroup") {
                                initializeGroupStats_1(chatId);
                            }
                            if (groupStats_1[chatId]) {
                                groupStats_1[chatId].totalMessages++;
                                messageSizeKB = parseFloat(calculateMessageSizeKB_1(ctx.message).toString());
                                groupStats_1[chatId].totalSizeKB += messageSizeKB;
                            }
                            else {
                                console.log("Il gruppo con ID ".concat(chatId, " non \u00E8 stato inizializzato."));
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    bot_1.launch();
                    app_1.get("/", function (_req, res) {
                        res.send("Server is running and bot is active.");
                    });
                    PORT_1 = process.env.PORT || 3000;
                    app_1.listen(PORT_1, function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log("Server is running on port ".concat(PORT_1));
                            cron_1.schedule("* * * * *", function () {
                                console.log("Esecuzione del job di invio report ogni minuto !");
                                if (Object.keys(groupStats_1).length > 0) {
                                    sendReport_1();
                                    groupStats_1 = {}; // Clear the object after sending report
                                }
                                else {
                                    console.log("Nessun dato da inviare.");
                                }
                            });
                            return [2 /*return*/];
                        });
                    }); });
                    sendEmptyReport_1 = function (chatId, chatInfo) { return __awaiter(_this, void 0, void 0, function () {
                        var payload, reportEndpoint, response, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!chatId) {
                                        console.error("Chat ID mancante.");
                                        return [2 /*return*/];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    payload = {
                                        groupId: chatId,
                                        totalMessages: 0,
                                        totalSizeKB: 0,
                                        emissionsOneByteMethod: 0,
                                        emissionsSWDMethod: 0,
                                        groupName: chatInfo.title,
                                        participantsCount: chatInfo.membersCount,
                                    };
                                    reportEndpoint = process.env.REPORT_ENDPOINT ||
                                        "http://localhost:3005/api/v1/reports";
                                    return [4 /*yield*/, axios_1.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                                        )];
                                case 2:
                                    response = _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_4 = _a.sent();
                                    if (error_4.response &&
                                        error_4.response.status === 403) {
                                        console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                                    }
                                    else {
                                        console.error("Errore durante l'invio del report:", error_4);
                                    }
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    sendReport_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _c, chatId_1, stats, totalSizeBytes, emissionsOneByteMethod, emissionsSWDMethod, participantsCount, totalMessages, totalSizeKB, emissionsOneByte, emissionsSWD, chatInfo_1, payload, reportEndpoint, response, error_5, e_1_1, allChats, allChats_1, allChats_1_1, chat, chatId_2, chatInfo_2, e_2_1;
                        var e_1, _d, e_2, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 9, 10, 11]);
                                    _a = __values(Object.entries(groupStats_1)), _b = _a.next();
                                    _f.label = 1;
                                case 1:
                                    if (!!_b.done) return [3 /*break*/, 8];
                                    _c = __read(_b.value, 2), chatId_1 = _c[0], stats = _c[1];
                                    totalSizeBytes = stats.totalSizeKB * 1024;
                                    emissionsOneByteMethod = oneByte_1
                                        .perByte(totalSizeBytes)
                                        .toFixed(7);
                                    emissionsSWDMethod = swd_1.perByte(totalSizeBytes).toFixed(7);
                                    return [4 /*yield*/, getParticipantsCount_1(chatId_1)];
                                case 2:
                                    participantsCount = _f.sent();
                                    totalMessages = stats.totalMessages || 0;
                                    totalSizeKB = stats.totalSizeKB || 0;
                                    emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
                                        ? 0
                                        : parseFloat(emissionsOneByteMethod);
                                    emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
                                        ? 0
                                        : parseFloat(emissionsSWDMethod);
                                    _f.label = 3;
                                case 3:
                                    _f.trys.push([3, 6, , 7]);
                                    return [4 /*yield*/, bot_1.telegram.getChat(chatId_1)];
                                case 4:
                                    chatInfo_1 = _f.sent();
                                    payload = {
                                        groupId: chatId_1,
                                        totalMessages: totalMessages,
                                        totalSizeKB: totalSizeKB,
                                        emissionsOneByteMethod: emissionsOneByte,
                                        emissionsSWDMethod: emissionsSWD,
                                        groupName: chatInfo_1.title,
                                        participantsCount: participantsCount,
                                    };
                                    reportEndpoint = process.env.REPORT_ENDPOINT ||
                                        "http://localhost:3005/api/v1/reports";
                                    return [4 /*yield*/, axios_1.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                                        )];
                                case 5:
                                    response = _f.sent();
                                    // Azzeriamo solo i contatori dopo l'invio del report
                                    groupStats_1[chatId_1] = { totalMessages: 0, totalSizeKB: 0 };
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_5 = _f.sent();
                                    if (error_5.response &&
                                        error_5.response.status === 403) {
                                        console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                                    }
                                    else {
                                        console.error("Errore durante l'invio del report :", error_5);
                                    }
                                    return [3 /*break*/, 7];
                                case 7:
                                    _b = _a.next();
                                    return [3 /*break*/, 1];
                                case 8: return [3 /*break*/, 11];
                                case 9:
                                    e_1_1 = _f.sent();
                                    e_1 = { error: e_1_1 };
                                    return [3 /*break*/, 11];
                                case 10:
                                    try {
                                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                    return [7 /*endfinally*/];
                                case 11:
                                    if (!(Object.keys(groupStats_1).length === 0)) return [3 /*break*/, 21];
                                    return [4 /*yield*/, bot_1.telegram.getMyCommands()];
                                case 12:
                                    allChats = _f.sent();
                                    _f.label = 13;
                                case 13:
                                    _f.trys.push([13, 19, 20, 21]);
                                    allChats_1 = __values(allChats), allChats_1_1 = allChats_1.next();
                                    _f.label = 14;
                                case 14:
                                    if (!!allChats_1_1.done) return [3 /*break*/, 18];
                                    chat = allChats_1_1.value;
                                    chatId_2 = chat.chat.id;
                                    return [4 /*yield*/, bot_1.telegram.getChat(chatId_2)];
                                case 15:
                                    chatInfo_2 = _f.sent();
                                    return [4 /*yield*/, sendEmptyReport_1(chatId_2, chatInfo_2)];
                                case 16:
                                    _f.sent();
                                    _f.label = 17;
                                case 17:
                                    allChats_1_1 = allChats_1.next();
                                    return [3 /*break*/, 14];
                                case 18: return [3 /*break*/, 21];
                                case 19:
                                    e_2_1 = _f.sent();
                                    e_2 = { error: e_2_1 };
                                    return [3 /*break*/, 21];
                                case 20:
                                    try {
                                        if (allChats_1_1 && !allChats_1_1.done && (_e = allChats_1.return)) _e.call(allChats_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                    return [7 /*endfinally*/];
                                case 21: return [2 /*return*/];
                            }
                        });
                    }); };
                    console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                }
                else {
                    console.error("Errore durante l'invio del report:", error_2);
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var sendReport = function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b, _c, chatId, stats, totalSizeBytes, emissionsOneByteMethod, emissionsSWDMethod, participantsCount, totalMessages, totalSizeKB, emissionsOneByte, emissionsSWD, chatInfo, payload, reportEndpoint, response, error_6, e_3_1, allChats, allChats_2, allChats_2_1, chat, chatId, chatInfo, e_4_1;
    var e_3, _d, e_4, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 9, 10, 11]);
                _a = __values(Object.entries(groupStats)), _b = _a.next();
                _f.label = 1;
            case 1:
                if (!!_b.done) return [3 /*break*/, 8];
                _c = __read(_b.value, 2), chatId = _c[0], stats = _c[1];
                totalSizeBytes = stats.totalSizeKB * 1024;
                emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
                emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);
                return [4 /*yield*/, getParticipantsCount(chatId)];
            case 2:
                participantsCount = _f.sent();
                totalMessages = stats.totalMessages || 0;
                totalSizeKB = stats.totalSizeKB || 0;
                emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
                    ? 0
                    : parseFloat(emissionsOneByteMethod);
                emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
                    ? 0
                    : parseFloat(emissionsSWDMethod);
                _f.label = 3;
            case 3:
                _f.trys.push([3, 6, , 7]);
                return [4 /*yield*/, bot.telegram.getChat(chatId)];
            case 4:
                chatInfo = _f.sent();
                payload = {
                    groupId: chatId,
                    totalMessages: totalMessages,
                    totalSizeKB: totalSizeKB,
                    emissionsOneByteMethod: emissionsOneByte,
                    emissionsSWDMethod: emissionsSWD,
                    groupName: chatInfo.title,
                    participantsCount: participantsCount,
                };
                reportEndpoint = process.env.REPORT_ENDPOINT || "http://localhost:3005/api/v1/reports";
                return [4 /*yield*/, axios.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                    )];
            case 5:
                response = _f.sent();
                // Azzeriamo solo i contatori dopo l'invio del report
                groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
                return [3 /*break*/, 7];
            case 6:
                error_6 = _f.sent();
                if (error_6.response && error_6.response.status === 403) {
                    console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                }
                else {
                    console.error("Errore durante l'invio del report :", error_6);
                }
                return [3 /*break*/, 7];
            case 7:
                _b = _a.next();
                return [3 /*break*/, 1];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_3_1 = _f.sent();
                e_3 = { error: e_3_1 };
                return [3 /*break*/, 11];
            case 10:
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
                return [7 /*endfinally*/];
            case 11:
                if (!(Object.keys(groupStats).length === 0)) return [3 /*break*/, 21];
                return [4 /*yield*/, bot.telegram.getMyCommands()];
            case 12:
                allChats = _f.sent();
                _f.label = 13;
            case 13:
                _f.trys.push([13, 19, 20, 21]);
                allChats_2 = __values(allChats), allChats_2_1 = allChats_2.next();
                _f.label = 14;
            case 14:
                if (!!allChats_2_1.done) return [3 /*break*/, 18];
                chat = allChats_2_1.value;
                chatId = chat.chat.id;
                return [4 /*yield*/, bot.telegram.getChat(chatId)];
            case 15:
                chatInfo = _f.sent();
                return [4 /*yield*/, sendEmptyReport(chatId, chatInfo)];
            case 16:
                _f.sent();
                _f.label = 17;
            case 17:
                allChats_2_1 = allChats_2.next();
                return [3 /*break*/, 14];
            case 18: return [3 /*break*/, 21];
            case 19:
                e_4_1 = _f.sent();
                e_4 = { error: e_4_1 };
                return [3 /*break*/, 21];
            case 20:
                try {
                    if (allChats_2_1 && !allChats_2_1.done && (_e = allChats_2.return)) _e.call(allChats_2);
                }
                finally { if (e_4) throw e_4.error; }
                return [7 /*endfinally*/];
            case 21: return [2 /*return*/];
        }
    });
}); };
