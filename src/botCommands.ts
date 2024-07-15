import { Context } from "telegraf";
import { GroupStats } from "./types/types";

export const startCommand = (ctx: Context) => {
  ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};

export const helpCommand = (ctx: Context) => {
  ctx.reply(
    "Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo"
  );
};

export const limitCommand = (
  ctx: Context,
  groupLimitGeneric: Record<string, number>
) => {
  const chatId = ctx.message?.chat?.id;

  if (chatId) {
    const genericLimit = groupLimitGeneric[chatId];

    if (!genericLimit) {
      ctx.reply("Non ci sono limiti impostati per questo gruppo.");
    } else {
      ctx.reply(`Limite generico: ${genericLimit} KB`);
    }
  } else {
    ctx.reply(
      "Impossibile determinare il limite del gruppo. Il chatId non è disponibile."
    );
  }
};

export const statsCommand = (
  ctx: Context,
  groupStats: Record<string, GroupStats>
) => {
  const chatId = ctx.message?.chat?.id;
  if (chatId && groupStats[chatId]) {
    const stats = groupStats[chatId];
    ctx.reply(
      `Statistiche del gruppo - ultima ora (non ancora spediti al db):\nMessaggi totali: ${
        stats.totalMessages
      }\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`
    );
  } else {
    ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
  }
};

export const getAdminsCommand = async (ctx: Context) => {
  const chatId = ctx.message?.chat?.id;
  if (chatId) {
    try {
      const admins = await ctx.telegram.getChatAdministrators(chatId);

      ctx.reply(
        `Gli amministratori del gruppo sono: ${admins
          .map((admin: { user: { first_name: any } }) => admin.user.first_name)
          .join(", ")}`
      );
    } catch (error) {
      console.error("Errore durante il recupero degli amministratori:", error);
      ctx.reply(
        "Si è verificato un errore durante il recupero degli amministratori."
      );
    }
  } else {
    ctx.reply(
      "Impossibile determinare gli amministratori del gruppo. Il chatId non è disponibile."
    );
  }
};
