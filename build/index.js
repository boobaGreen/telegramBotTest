"use strict";
// index.ts
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
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();
const cron = require("node-cron");
const { Telegraf, Context } = require("telegraf");
const groupLimitRoutes_1 = __importDefault(require("./routes/groupLimitRoutes"));
const getMemberCount_1 = require("./utils/getMemberCount");
const getKbSize_1 = require("./utils/getKbSize");
const getTypeMessage_1 = require("./utils/getTypeMessage");
const statsUtils_1 = require("./utils/statsUtils");
const isBotAdmin_1 = require("./utils/isBotAdmin");
const updateStats_1 = require("./utils/updateStats");
const reportUtils_1 = require("./utils/reportUtils"); // Importa le nuove funzioni
const getAdminsIds_1 = require("./utils/getAdminsIds");
const botCommands_1 = require("./botCommands"); // Importa i comandi
const bot = new Telegraf(process.env.BOT_TOKEN);
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let groupStats = {};
let groupLimitGeneric = {};
bot.start(botCommands_1.startCommand);
bot.help(botCommands_1.helpCommand);
bot.command("get_admins", botCommands_1.getAdminsCommand);
bot.command("stats", (ctx) => (0, botCommands_1.statsCommand)(ctx, groupStats));
bot.command("limits", (ctx) => (0, botCommands_1.limitCommand)(ctx, groupLimitGeneric));
bot.on("message", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    const chatType = (_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.type;
    if (!groupStats[chatId] && chatType === "supergroup") {
        (0, statsUtils_1.initializeGroupStats)(chatId, groupStats);
    }
    const isAdmin = yield (0, isBotAdmin_1.isBotAdmin)(ctx);
    if (isAdmin && groupStats[chatId]) {
        const messageSizeKB = parseFloat((0, getKbSize_1.calculateMessageSizeKB)(ctx.message).toString());
        const typeOfMessage = (0, getTypeMessage_1.getTypemessages)(ctx.message);
        // Aggiornamento dei contatori
        (0, updateStats_1.updateStats)(chatId, messageSizeKB, typeOfMessage, groupStats);
        const genericLimitReached = groupLimitGeneric[chatId] &&
            messageSizeKB > groupLimitGeneric[chatId];
        // Check if generic limit is reached and delete message if necessary
        if (genericLimitReached) {
            ctx.deleteMessage();
            ctx.reply(`Il messaggio è stato rimosso perché supera il limite di dimensione generico di ${groupLimitGeneric[chatId]} impostato per il gruppo.`);
        }
    }
    else {
        console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
    }
    next();
}));
bot.launch();
app.use(groupLimitRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on port ${PORT} 5`);
    cron.schedule("0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        if (Object.keys(groupStats).length > 0) {
            const chatInfos = {}; // Mappa chatId a chatInfo
            for (const chatId in groupStats) {
                if (groupStats.hasOwnProperty(chatId)) {
                    const chatInfo = yield bot.telegram.getChat(chatId);
                    chatInfos[chatId] = {
                        title: chatInfo.title,
                        membersCount: yield (0, getMemberCount_1.getParticipantsCount)(chatId),
                        adminIds: yield (0, getAdminsIds_1.getAdminIds)(chatId, bot),
                    };
                }
            }
            yield (0, reportUtils_1.sendReport)(groupStats, chatInfos);
        }
        else {
            console.log("Nessun dato da inviare.");
            const allChats = yield bot.telegram.getMyCommands();
            for (const chat of allChats) {
                const chatId = chat.chat.id;
                const chatInfo = yield bot.telegram.getChat(chatId);
                yield (0, reportUtils_1.sendEmptyReport)(chatId, chatInfo);
            }
        }
    }));
}));
