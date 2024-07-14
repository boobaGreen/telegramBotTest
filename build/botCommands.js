"use strict";
const startCommand = (ctx) => {
    ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};
const helpCommand = (ctx) => {
    ctx.reply("Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo");
};
// Esporta tutti i comandi che desideri usare
module.exports = {
    startCommand,
    helpCommand,
};
