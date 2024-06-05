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
var bot = new Telegraf("7317510692:AAF20M_I-Gz8g8PCnbE3fPjCnwRM9cKF784");
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
    var payload, reportEndpoint, response, error_1;
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
                reportEndpoint = "http://localhost:3005/api/v1/reports";
                return [4 /*yield*/, axios.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                    )];
            case 2:
                response = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                if (error_1.response && error_1.response.status === 403) {
                    console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                }
                else {
                    console.error("Errore durante l'invio del report:", error_1);
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var sendReport = function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b, _c, chatId, stats, totalSizeBytes, emissionsOneByteMethod, emissionsSWDMethod, totalMessages, totalSizeKB, emissionsOneByte, emissionsSWD, chatInfo, payload, reportEndpoint, response, error_2, e_1_1, allChats, allChats_1, allChats_1_1, chat, chatId, chatInfo, e_2_1;
    var e_1, _d, e_2, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 8, 9, 10]);
                _a = __values(Object.entries(groupStats)), _b = _a.next();
                _f.label = 1;
            case 1:
                if (!!_b.done) return [3 /*break*/, 7];
                _c = __read(_b.value, 2), chatId = _c[0], stats = _c[1];
                totalSizeBytes = stats.totalSizeKB * 1024;
                emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
                emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);
                totalMessages = stats.totalMessages || 0;
                totalSizeKB = stats.totalSizeKB || 0;
                emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
                    ? 0
                    : parseFloat(emissionsOneByteMethod);
                emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
                    ? 0
                    : parseFloat(emissionsSWDMethod);
                _f.label = 2;
            case 2:
                _f.trys.push([2, 5, , 6]);
                return [4 /*yield*/, bot.telegram.getChat(chatId)];
            case 3:
                chatInfo = _f.sent();
                payload = {
                    groupId: chatId,
                    totalMessages: totalMessages,
                    totalSizeKB: totalSizeKB,
                    emissionsOneByteMethod: emissionsOneByte,
                    emissionsSWDMethod: emissionsSWD,
                    groupName: chatInfo.title,
                    participantsCount: chatInfo.membersCount,
                };
                reportEndpoint = "http://localhost:3005/api/v1/reports";
                return [4 /*yield*/, axios.post(reportEndpoint, payload // Specifica il tipo di payload come ReportPayload
                    )];
            case 4:
                response = _f.sent();
                // Azzeriamo solo i contatori dopo l'invio del report
                groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
                return [3 /*break*/, 6];
            case 5:
                error_2 = _f.sent();
                if (error_2.response && error_2.response.status === 403) {
                    console.error("Il bot non può inviare messaggi al gruppo. È stato rimosso?");
                }
                else {
                    console.error("Errore durante l'invio del report:", error_2);
                }
                return [3 /*break*/, 6];
            case 6:
                _b = _a.next();
                return [3 /*break*/, 1];
            case 7: return [3 /*break*/, 10];
            case 8:
                e_1_1 = _f.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 10];
            case 9:
                try {
                    if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 10:
                if (!(Object.keys(groupStats).length === 0)) return [3 /*break*/, 20];
                return [4 /*yield*/, bot.telegram.getMyCommands()];
            case 11:
                allChats = _f.sent();
                _f.label = 12;
            case 12:
                _f.trys.push([12, 18, 19, 20]);
                allChats_1 = __values(allChats), allChats_1_1 = allChats_1.next();
                _f.label = 13;
            case 13:
                if (!!allChats_1_1.done) return [3 /*break*/, 17];
                chat = allChats_1_1.value;
                chatId = chat.chat.id;
                return [4 /*yield*/, bot.telegram.getChat(chatId)];
            case 14:
                chatInfo = _f.sent();
                return [4 /*yield*/, sendEmptyReport(chatId, chatInfo)];
            case 15:
                _f.sent();
                _f.label = 16;
            case 16:
                allChats_1_1 = allChats_1.next();
                return [3 /*break*/, 13];
            case 17: return [3 /*break*/, 20];
            case 18:
                e_2_1 = _f.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 20];
            case 19:
                try {
                    if (allChats_1_1 && !allChats_1_1.done && (_e = allChats_1.return)) _e.call(allChats_1);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 20: return [2 /*return*/];
        }
    });
}); };
