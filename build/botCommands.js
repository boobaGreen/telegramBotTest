"use strict";
const { Telegraf, Context } = require("telegraf");
const startCommand = (ctx) => {
    ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};
const helpCommand = (ctx) => {
    ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo");
};
const limitCommand = (ctx, groupLimitGeneric) => {
    var _a, _b;
    const chatId = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id;
    const genericLimit = groupLimitGeneric[chatId];
    if (!genericLimit) {
        ctx.reply("Non ci sono limiti impostati per questo gruppo.");
    }
    else {
        ctx.reply(`Limite generico: ${genericLimit} KB`);
    }
};
// Esporta tutti i comandi che desideri usare
module.exports = {
    startCommand,
    helpCommand,
    limitCommand,
};
