const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();
const axios = require("axios");
const cron = require("node-cron");
const { Telegraf, Context } = require("telegraf");
const { co2 } = require("@tgwf/co2");
const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });
const bot = new Telegraf(process.env.BOT_TOKEN);

import { calculateMessageSizeKB } from "./utils/getKbSize";
import { GroupStats, ReportPayload, Limit } from "./types/types";
import { getParticipantsCount } from "./utils/getMemberCount";

let groupStats: Record<string, GroupStats> = {};

let groupLimitGeneric: Record<string, number> = {};

let groupLimitDetailed: Record<string, Limit> = {};

const initializeGroupStats = (chatId: string) => {
  groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};

bot.start((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply("Benvenuto! Usa /help per visualizzare l'elenco dei comandi. ")
);

bot.help((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply(
    "Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo"
  )
);

// Function to check if the bot is still an administrator
const isBotAdmin = async (ctx: typeof Context): Promise<boolean> => {
  try {
    const administrators = await ctx.telegram.getChatAdministrators(
      ctx.message?.chat?.id
    );
    const botId = ctx.botInfo.id;
    return administrators.some(
      (admin: { user: { id: any } }) => admin.user.id === botId
    );
  } catch (error) {
    console.error("Errore durante il recupero degli amministratori:", error);
    return false;
  }
};

bot.command("stats", (ctx: typeof Context) => {
  const chatId = ctx.message?.chat?.id;
  if (chatId && groupStats[chatId]) {
    const stats = groupStats[chatId];
    ctx.reply(
      `Statistiche del gruppo - ultimo frame  :\nMessaggi totali: ${
        stats.totalMessages
      }\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`
    );
  } else {
    ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
  }
});

bot.command("get_admins", async (ctx: typeof Context) => {
  const chatId = ctx.message.chat.id;
  try {
    const admins = await ctx.telegram.getChatAdministrators(chatId);
    ctx.reply(
      `Gli amministratori del gruppo sono: ${admins
        .map((admin: { user: { username: any } }) => admin.user.username)
        .join(", ")}`
    );
  } catch (error) {
    console.error("Errore durante il recupero degli amministratori:", error);
    ctx.reply(
      "Si è verificato un errore durante il recupero degli amministratori."
    );
  }
});

// Middleware per gestire i messaggi in arrivo
bot.on("message", async (ctx: typeof Context, next: () => void) => {
  const chatId = ctx.message?.chat?.id;
  const chatType = ctx.message?.chat?.type;

  if (!groupStats[chatId as string] && chatType === "supergroup") {
    initializeGroupStats(chatId as string);
  }

  const isAdmin = await isBotAdmin(ctx);

  if (isAdmin && groupStats[chatId as string]) {
    const messageSizeKB = parseFloat(
      calculateMessageSizeKB(ctx.message).toString()
    );

    // Aggiornamento dei contatori
    updateStats(chatId as string, messageSizeKB);

    const genericLimitReached =
      groupLimitGeneric[chatId as string] &&
      messageSizeKB > groupLimitGeneric[chatId as string];

    const detailedLimitReachedExist =
      groupLimitDetailed[chatId as string] &&
      groupLimitDetailed[chatId as string] + "" != "";

    // Verifica del limite di dimensione e cancellazione del messaggio se necessario
    if (genericLimitReached || detailedLimitReachedExist) {
      ctx.deleteMessage();
      if (genericLimitReached) {
        ctx.reply(
          "Il messaggio è stato rimosso perché supera il limite di dimensione GENERICO impostato per il gruppo."
        );
      } else {
        ctx.reply(
          `Il messaggio è stato rimosso perché supera il limite di dimensione TEMPORALE impostato per il gruppo: ${
            groupLimitDetailed[chatId as string]
          }`
        );
      }
    }
  } else {
    console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
  }

  next();
});

// Funzione per aggiornare i contatori totalMessages e totalSizeKB
const updateStats = (chatId: string, messageSizeKB: number) => {
  if (groupStats[chatId]) {
    groupStats[chatId].totalMessages++;
    groupStats[chatId].totalSizeKB += messageSizeKB;
  }
};

bot.launch();

app.get("/test", (_req: any, res: any) => {
  console.log("test endpoint hit! wsb81");
  res.status(200).json({
    success:
      "Server is running and bot is active (add-limit-all-aws-get and remove limit).",
  });
});

app.post("/groupLimitGeneric", (req: any, res: any) => {
  const { chatId, limit } = req.body;
  if (!chatId || !limit) {
    return res.status(400).json({ error: "chatId e limit sono richiesti." });
  }

  groupLimitGeneric[chatId] = limit;
  res.status(200).json({
    success: `Limite generico impostato per il gruppo ${chatId}: ${limit} KB`,
  });
});

app.post("/groupLimitDetailed", (req: any, res: any) => {
  const { chatId, limitType } = req.body;
  if (!chatId || !limitType) {
    return res
      .status(400)
      .json({ error: "chatId e limitType sono richiesti." });
  }

  if (!["H", "D", "W", "M", "Y"].includes(limitType)) {
    return res.status(400).json({ error: "limitType non valido." });
  }

  groupLimitDetailed[chatId] = { limit: limitType };
  res.status(200).json({
    success: `Limite dettagliato impostato per il gruppo ${chatId}: ${limitType}`,
  });
});

const clearLimits = (limitType: string) => {
  for (const chatId in groupLimitDetailed) {
    if (groupLimitDetailed[chatId].limit === limitType) {
      delete groupLimitDetailed[chatId];
    }
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  cron.schedule("0 * * * *", () => {
    console.log("Rimozione dei limiti orari (H)");
    clearLimits("H");
  });

  cron.schedule("0 0 * * *", () => {
    console.log("Rimozione dei limiti giornalieri (D)");
    clearLimits("D");
  });

  cron.schedule("0 0 * * 0", () => {
    console.log("Rimozione dei limiti settimanali (W)");
    clearLimits("W");
  });

  cron.schedule("0 0 1 * *", () => {
    console.log("Rimozione dei limiti mensili (M)");
    clearLimits("M");
  });

  cron.schedule("0 0 1 1 *", () => {
    console.log("Rimozione dei limiti annuali (Y)");
    clearLimits("Y");
  });

  cron.schedule("*/1 * * * *", () => {
    console.log("Esecuzione del job di invio report ogni minuto!");
    if (Object.keys(groupStats).length > 0) {
      sendReport();
      groupStats = {}; // Clear the object after sending report
    } else {
      console.log("Nessun dato da inviare.");
    }
  });
});

let endPoint = "http://localhost:3005";
if (process.env.ENVIRONMENT === "production") {
  endPoint = process.env.REPORT_ENDPOINT || "";
}
console.log("Endpoint:", endPoint);
const finalEndPoint = endPoint + "/api/v1/reports";

const sendEmptyReport = async (chatId: string | undefined, chatInfo: any) => {
  if (!chatId) {
    console.error("Chat ID mancante.");
    return;
  }

  try {
    const payload: ReportPayload = {
      groupId: chatId,
      totalMessages: 0,
      totalSizeKB: 0,
      emissionsOneByteMethod: 0,
      emissionsSWDMethod: 0,
      groupName: chatInfo.title,
      participantsCount: chatInfo.membersCount,
      adminNames: [], // Campi adminNames vuoti nel report vuoto
    };

    const response = await axios.post(finalEndPoint, payload as ReportPayload, {
      headers: {
        "Content-Type": "application/json",
        Origin: "supersegretissimo", // Replace with your bot's origin
      },
    });
  } catch (error) {
    console.log("Errore durante l'invio del report vuoto:", error);
  }
};

const getAdminNames = async (chatId: string) => {
  try {
    const admins = await bot.telegram.getChatAdministrators(chatId);
    return admins.map(
      (admin: { user: { username: any } }) => admin.user.username
    );
  } catch (error) {
    console.error("Errore durante il recupero degli amministratori:", error);
    return [];
  }
};

const sendReport = async () => {
  for (const [chatId, stats] of Object.entries(groupStats)) {
    const totalSizeBytes = stats.totalSizeKB * 1024;
    const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
    const emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);

    // Ottieni il numero di partecipanti del gruppo
    const participantsCount = await getParticipantsCount(chatId);

    // Ottieni i nomi degli amministratori del gruppo
    const adminNames = await getAdminNames(chatId);
    console.log(adminNames, "adminNames ********************");

    // Verifica se ci sono stati messaggi nel lasso di tempo del report
    let totalMessages = stats.totalMessages || 0;
    let totalSizeKB = stats.totalSizeKB || 0;
    let emissionsOneByte = isNaN(parseFloat(emissionsOneByteMethod))
      ? 0
      : parseFloat(emissionsOneByteMethod);
    let emissionsSWD = isNaN(parseFloat(emissionsSWDMethod))
      ? 0
      : parseFloat(emissionsSWDMethod);

    try {
      const chatInfo = await bot.telegram.getChat(chatId);

      const payload: ReportPayload = {
        groupId: chatId,
        totalMessages,
        totalSizeKB,
        emissionsOneByteMethod: emissionsOneByte,
        emissionsSWDMethod: emissionsSWD,
        groupName: chatInfo.title,
        participantsCount, // Aggiungi il numero di partecipanti al payload
        adminNames, // Aggiungi i nomi degli amministratori al payload
      };
      console.log(payload, "payload **************");
      const response = await axios.post(
        finalEndPoint,
        payload as ReportPayload, // Specifica il tipo di payload come ReportPayload ,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Custom-Origin": "supersegretissimo", // Intestazione personalizzata
          },
        }
      );

      // Azzeriamo solo i contatori dopo l'invio del report
      groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
    } catch (error) {
      if ((error as any).response && (error as any).response.status === 403) {
        console.error(
          "Il bot non può inviare messaggi al gruppo. È stato rimosso?"
        );
      } else {
        console.error("Errore durante l'invio del report:", error);
      }
    }
  }

  // Se non ci sono messaggi in nessun gruppo, invia report vuoto per ogni gruppo
  if (Object.keys(groupStats).length === 0) {
    const allChats = await bot.telegram.getMyCommands();
    for (const chat of allChats) {
      const chatId = chat.chat.id;
      const chatInfo = await bot.telegram.getChat(chatId);
      await sendEmptyReport(chatId, chatInfo);
    }
  }
};
