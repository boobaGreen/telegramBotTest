// index.ts

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();

const cron = require("node-cron");

const { Telegraf, Context } = require("telegraf");
const { co2 } = require("@tgwf/co2");
const { startCommand, helpCommand, limitCommand } = require("./botCommands"); // Importa i comandi

import groupLimitRoutes from "./routes/groupLimitRoutes";
import { calculateMessageSizeKB } from "./utils/getKbSize";
import { GroupStats } from "./types/types";

import { getTypemessages } from "./utils/getTypeMessage";
import { initializeGroupStats } from "./utils/statsUtils";
import { isBotAdmin } from "./utils/isBotAdmin";
import { updateStats } from "./utils/updateStats";
import { sendEmptyReport, sendReport } from "./utils/reportUtils"; // Importa le nuove funzioni
import { getAdminIds } from "./utils/getAdminsIds";

const bot = new Telegraf(process.env.BOT_TOKEN);

const bodyParser = require("body-parser");

app.use(bodyParser.json());

let groupStats: Record<string, GroupStats> = {};
let groupLimitGeneric: Record<string, number> = {};

bot.start(startCommand);
bot.help(helpCommand);

bot.command("limits", (ctx: any) => limitCommand(ctx, groupLimitGeneric));

bot.command("stats", (ctx: typeof Context) => {
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
});

bot.command("get_admins", async (ctx: typeof Context) => {
  const chatId = ctx.message.chat.id;
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
});

bot.on("message", async (ctx: typeof Context, next: () => void) => {
  const chatId = ctx.message?.chat?.id;
  const chatType = ctx.message?.chat?.type;

  if (!groupStats[chatId as string] && chatType === "supergroup") {
    initializeGroupStats(chatId as string, groupStats);
  }

  const isAdmin = await isBotAdmin(ctx);

  if (isAdmin && groupStats[chatId as string]) {
    const messageSizeKB = parseFloat(
      calculateMessageSizeKB(ctx.message).toString()
    );

    const typeOfMessage = getTypemessages(ctx.message);

    // Aggiornamento dei contatori
    updateStats(chatId as string, messageSizeKB, typeOfMessage, groupStats);

    const genericLimitReached =
      groupLimitGeneric[chatId as string] &&
      messageSizeKB > groupLimitGeneric[chatId as string];

    // Check if generic limit is reached and delete message if necessary
    if (genericLimitReached) {
      ctx.deleteMessage();
      ctx.reply(
        `Il messaggio è stato rimosso perché supera il limite di dimensione generico di ${groupLimitGeneric[chatId]} impostato per il gruppo.`
      );
    }
  } else {
    console.log(`Il bot con ID ${bot.botInfo.id} non è più un amministratore.`);
  }

  next();
});

bot.launch();
app.use(groupLimitRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  cron.schedule("*/5 * * * *", async () => {
    console.log("Esecuzione del job di invio report ogni 5 minuti !");

    if (Object.keys(groupStats).length > 0) {
      const chatInfos: { [key: string]: any } = {}; // Mappa chatId a chatInfo
      for (const chatId in groupStats) {
        if (groupStats.hasOwnProperty(chatId)) {
          const chatInfo = await bot.telegram.getChat(chatId);
          chatInfos[chatId] = {
            title: chatInfo.title,
            membersCount: chatInfo.membersCount,
            adminIds: await getAdminIds(chatId, bot), // Passa il bot come argomento
          };
        }
      }

      console.log("groupStats", groupStats);

      await sendReport(groupStats, chatInfos);
      groupStats = {}; // Clear the object after sending report
    } else {
      console.log("Nessun dato da inviare.");
      const allChats = await bot.telegram.getMyCommands();
      for (const chat of allChats) {
        const chatId = chat.chat.id;
        const chatInfo = await bot.telegram.getChat(chatId);
        await sendEmptyReport(chatId, chatInfo);
      }
    }
  });
});
