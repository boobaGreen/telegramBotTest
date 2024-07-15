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
exports.getAdminsCommand = exports.statsCommand = exports.limitCommand = exports.helpCommand = exports.startCommand = void 0;
const startCommand = (ctx) => {
    ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};
exports.startCommand = startCommand;
const helpCommand = (ctx) => {
    ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo");
};
exports.helpCommand = helpCommand;
const limitCommand = (ctx, groupLimitGeneric) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId) {
        const genericLimit = groupLimitGeneric[chatId];
        if (!genericLimit) {
            ctx.reply("Non ci sono limiti impostati per questo gruppo.");
        }
        else {
            ctx.reply(`Limite generico: ${genericLimit} KB`);
        }
    }
    else {
        ctx.reply("Impossibile determinare il limite del gruppo. Il chatId non è disponibile.");
    }
};
exports.limitCommand = limitCommand;
const statsCommand = (ctx, groupStats) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId && groupStats[chatId]) {
        const stats = groupStats[chatId];
        ctx.reply(`Statistiche del gruppo - ultima ora (non ancora spediti al db):\nMessaggi totali: ${stats.totalMessages}\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`);
    }
    else {
        ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
    }
};
exports.statsCommand = statsCommand;
const getAdminsCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    if (chatId) {
        try {
            const admins = yield ctx.telegram.getChatAdministrators(chatId);
            ctx.reply(`Gli amministratori del gruppo sono: ${admins
                .map((admin) => admin.user.first_name)
                .join(", ")}`);
        }
        catch (error) {
            console.error("Errore durante il recupero degli amministratori:", error);
            ctx.reply("Si è verificato un errore durante il recupero degli amministratori.");
        }
    }
    else {
        ctx.reply("Impossibile determinare gli amministratori del gruppo. Il chatId non è disponibile.");
    }
});
exports.getAdminsCommand = getAdminsCommand;
