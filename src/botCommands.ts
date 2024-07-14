const { Telegraf, Context } = require("telegraf");

const startCommand = (ctx: { reply: (arg0: string) => void }) => {
  ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};

const helpCommand = (ctx: { reply: (arg0: string) => void }) => {
  ctx.reply(
    "Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo"
  );
};

const limitCommand = (
  ctx: typeof Context,
  groupLimitGeneric: Record<string, number>
) => {
  const chatId = ctx.message?.chat?.id;
  const genericLimit = groupLimitGeneric[chatId];

  if (!genericLimit) {
    ctx.reply("Non ci sono limiti impostati per questo gruppo.");
  } else {
    ctx.reply(`Limite generico: ${genericLimit} KB`);
  }
};

// Esporta tutti i comandi che desideri usare
module.exports = {
  startCommand,
  helpCommand,
  limitCommand,
};
