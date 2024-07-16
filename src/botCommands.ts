import { Context } from "telegraf";
import { GroupStats } from "./types/types";

/**
 * Comando /start: risponde con un messaggio di benvenuto.
 * Questa funzione invia un messaggio di benvenuto all'utente quando viene eseguito il comando /start.
 *
 * @param ctx - Il contesto della richiesta di Telegraf che contiene le informazioni sul messaggio e sul chat.
 */
export const startCommand = (ctx: Context) => {
  ctx.reply("Benvenuto a te! Usa /help per visualizzare l'elenco dei comandi.");
};

/**
 * Comando /help: fornisce un elenco dei comandi disponibili.
 * Questa funzione invia un messaggio che elenca tutti i comandi disponibili e le loro descrizioni.
 *
 * @param ctx - Il contesto della richiesta di Telegraf che contiene le informazioni sul messaggio e sul chat.
 */
export const helpCommand = (ctx: Context) => {
  ctx.reply(
    "Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche orarie del gruppo dell'ultima ora (report attuale orario non ancora inviato) \n/get_admins - Indica gli admin del gruppo\n/start - Saluta il bot\n/limits - Mostra il limite di dimensione impostato per il gruppo"
  );
};

/**
 * Comando /limits: mostra il limite di dimensione impostato per il gruppo.
 * Questa funzione invia un messaggio che indica il limite di dimensione del gruppo, se impostato.
 *
 * @param ctx - Il contesto della richiesta di Telegraf che contiene le informazioni sul messaggio e sul chat.
 * @param groupLimitGeneric - Un oggetto che mappa gli ID delle chat ai limiti di dimensione generici dei gruppi.
 */
export const limitCommand = (
  ctx: Context,
  groupLimitGeneric: Record<string, number>
) => {
  const chatId = ctx.message?.chat?.id;

  if (chatId) {
    const genericLimit = groupLimitGeneric[chatId];

    // Verifica se esiste un limite per il gruppo
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

/**
 * Comando /stats: mostra le statistiche del gruppo dell'ultima ora.
 * Questa funzione invia un messaggio con le statistiche del gruppo per l'ultima ora, inclusi il numero totale di messaggi e la dimensione totale.
 *
 * @param ctx - Il contesto della richiesta di Telegraf che contiene le informazioni sul messaggio e sul chat.
 * @param groupStats - Un oggetto che mappa gli ID delle chat ai dati delle statistiche del gruppo.
 */
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

/**
 * Comando /get_admins: restituisce un elenco degli amministratori del gruppo.
 * Questa funzione invia un messaggio con i nomi degli amministratori del gruppo, se disponibili.
 *
 * @param ctx - Il contesto della richiesta di Telegraf che contiene le informazioni sul messaggio e sul chat.
 */
export const getAdminsCommand = async (ctx: Context) => {
  const chatId = ctx.message?.chat?.id;
  if (chatId) {
    try {
      const admins = await ctx.telegram.getChatAdministrators(chatId);

      // Risponde con un elenco dei nomi degli amministratori
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
