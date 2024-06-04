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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config(); // Carica le variabili di ambiente da .env
var express = require("express");
var _a = require("telegraf"), Telegraf = _a.Telegraf, Context = _a.Context;
var axios_1 = require("axios");
var cron = require("node-cron");
var app = express();
var bot = new Telegraf("7317510692:AAF20M_I-Gz8g8PCnbE3fPjCnwRM9cKF784");
var EmissionsMethod;
(function (EmissionsMethod) {
    EmissionsMethod[EmissionsMethod["OneByte"] = 0] = "OneByte";
    EmissionsMethod[EmissionsMethod["SWD"] = 1] = "SWD";
})(EmissionsMethod || (EmissionsMethod = {}));
var Weekday;
(function (Weekday) {
    Weekday[Weekday["Sunday"] = 0] = "Sunday";
    Weekday[Weekday["Monday"] = 1] = "Monday";
    Weekday[Weekday["Tuesday"] = 2] = "Tuesday";
    Weekday[Weekday["Wednesday"] = 3] = "Wednesday";
    Weekday[Weekday["Thursday"] = 4] = "Thursday";
    Weekday[Weekday["Friday"] = 5] = "Friday";
    Weekday[Weekday["Saturday"] = 6] = "Saturday";
})(Weekday || (Weekday = {}));
var groupStats = {};
var calculateMessageSizeKB = function (message) {
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
    else {
        return "Tipo di messaggio non supportato";
    }
};
var getTimestampDetails = function () {
    var timestamp = new Date().toISOString();
    var hourOfDay = new Date().getUTCHours();
    var date = {
        day: new Date().getUTCDate(),
        month: new Date().getUTCMonth() + 1,
        year: new Date().getUTCFullYear(),
        weekday: new Date().toLocaleDateString("en-US", {
            weekday: "long",
        }), // Cast to Weekday
    };
    return { timestamp: timestamp, hourOfDay: hourOfDay, date: date };
};
var co2 = require("@tgwf/co2").co2;
var oneByte = new co2({ model: "1byte" });
var swd = new co2({ model: "swd" });
console.log("Bot started");
bot.start(function (ctx) {
    return ctx.reply("This message show when you use the /start command on the bot");
});
bot.help(function (ctx) {
    return ctx.reply("This message show when you use the /help command on the bot");
});
bot.on("message", function (ctx) {
    var _a, _b;
    var chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (!groupStats[chatId]) {
        groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
    }
    groupStats[chatId].totalMessages++;
    var messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message));
    groupStats[chatId].totalSizeKB += messageSizeKB;
    var totalSizeBytes = groupStats[chatId].totalSizeKB * 1024;
    var emissionsOneByteMethod = oneByte.perByte(totalSizeBytes);
    var emissionsSWDMethod = swd.perByte(totalSizeBytes);
    ctx.reply("La dimensione del messaggio \u00E8 di ".concat(messageSizeKB, " KB. Totale messaggi: ").concat(groupStats[chatId].totalMessages, ". Peso totale: ").concat(groupStats[chatId].totalSizeKB.toFixed(3), "Kb e le emissioni di CO2 associate sono di ").concat(emissionsOneByteMethod, " g. invece con il metodo SWD sono di ").concat(emissionsSWDMethod, " g."));
    ctx.reply("Contenuto totale di ctx.message:".concat(JSON.stringify(ctx.message)));
});
bot.launch();
app.get("/", function (_req, res) {
    res.send("Server is running and bot is active. grammi version");
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    var reportEndpoint, sendReport;
    return __generator(this, function (_a) {
        console.log("Server is running on port ".concat(PORT));
        reportEndpoint = "http://co2-back.us-west-2.elasticbeanstalk.com/reports";
        sendReport = function () { return __awaiter(void 0, void 0, void 0, function () {
            var timestampDetails, _i, _a, _b, chatId, stats, totalSizeBytes, emissionsOneByteMethod, emissionsSWDMethod, payload, response, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        timestampDetails = getTimestampDetails();
                        _i = 0, _a = Object.entries(groupStats);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], chatId = _b[0], stats = _b[1];
                        totalSizeBytes = stats.totalSizeKB * 1024;
                        emissionsOneByteMethod = oneByte.perByte(totalSizeBytes);
                        emissionsSWDMethod = swd.perByte(totalSizeBytes);
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        payload = {
                            groupId: chatId,
                            groupName: "GroupNamePlaceholder",
                            totalMessages: stats.totalMessages,
                            totalSizeKB: stats.totalSizeKB,
                            emissionsOneByteMethod: emissionsOneByteMethod.toFixed(3),
                            emissionsSWDMethod: emissionsSWDMethod.toFixed(3),
                            timestampDetails: timestampDetails,
                        };
                        return [4 /*yield*/, axios_1.default.post(reportEndpoint, payload)];
                    case 3:
                        response = _c.sent();
                        console.log("Report inviato con successo:", response.data);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        if (error_1 instanceof Error) {
                            console.error("Errore durante l'invio del report:", error_1.message);
                        }
                        else {
                            console.error("Errore durante l'invio del report:", error_1);
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        cron.schedule("*/5 * * * *", function () {
            console.log("Esecuzione del job di invio report ogni 5 minuti");
            sendReport();
        });
        return [2 /*return*/];
    });
}); });
