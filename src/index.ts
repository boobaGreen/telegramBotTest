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
import { GroupStats, ReportPayload } from "./types/types";
import { getParticipantsCount } from "./utils/getMemberCount";

let groupStats: Record<string, GroupStats> = {};

const initializeGroupStats = (chatId: string) => {
  groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};

bot.start((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply("Benvenuto! Usa /help per visualizzare l'elenco dei comandi.")
);

bot.help((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply(
    "Elenco dei comandi disponibili:\n/help - Mostra l'elenco dei comandi disponibili\n/stats - Visualizza le statistiche del gruppo"
  )
);

bot.command("stats", (ctx: typeof Context) => {
  const chatId = ctx.message?.chat?.id;
  if (chatId && groupStats[chatId]) {
    const stats = groupStats[chatId];
    ctx.reply(
      `Statistiche del gruppo - ultimo frame non ancora report finito :\nMessaggi totali: ${
        stats.totalMessages
      }\nDimensione totale: ${stats.totalSizeKB.toFixed(3)} KB`
    );
  } else {
    ctx.reply("Non ci sono statistiche disponibili per questo gruppo.");
  }
});

bot.on("message", async (ctx: typeof Context) => {
  const chatId = ctx.message?.chat?.id;
  const chatType = ctx.message?.chat?.type;

  if (!groupStats[chatId as string] && chatType === "supergroup" || chatType === "channel" ) {
    initializeGroupStats(chatId as string);
  }

  // Check if the bot is still an administrator
  const isAdmin = await isBotAdmin(ctx);

  if (isAdmin && groupStats[chatId as string]) {
    groupStats[chatId as string].totalMessages++;
    const messageSizeKB = parseFloat(
      calculateMessageSizeKB(ctx.message).toString()
    );
    groupStats[chatId as string].totalSizeKB += messageSizeKB;
  } else {
    console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
  }
});

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

bot.launch();

app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
  res.send("Server is running and bot is active.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  cron.schedule("*/15 * * * *", () => {
    console.log("Esecuzione del job di invio report ogni minuto !");
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
    };

    const response = await axios.post(
      finalEndPoint,
      payload as ReportPayload // Specifica il tipo di payload come ReportPayload
    );
  } catch (error) {
    console.log("Errore durante l'invio del report vuoto:", error);
  }
};

const sendReport = async () => {
  for (const [chatId, stats] of Object.entries(groupStats)) {
    const totalSizeBytes = stats.totalSizeKB * 1024;
    const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(7);
    const emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(7);

    // Ottieni il numero di partecipanti del gruppo
    const participantsCount = await getParticipantsCount(chatId);

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
      };

      const response = await axios.post(
        finalEndPoint,
        payload as ReportPayload // Specifica il tipo di payload come ReportPayload
      );

      // Azzeriamo solo i contatori dopo l'invio del report
      groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
    } catch (error) {
      if ((error as any).response && (error as any).response.status === 403) {
        console.error(
          "Il bot non può inviare messaggi al gruppo. È stato rimosso ?"
        );
      } else {
        console.error("Errore durante l'invio del report :", error);
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
