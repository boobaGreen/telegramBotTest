require("dotenv").config(); // Carica le variabili di ambiente da .env
const express = require("express");
const { Telegraf, Context } = require("telegraf");

import axios from "axios";

const cron = require("node-cron");

const app = express();
const bot = new Telegraf("7317510692:AAF20M_I-Gz8g8PCnbE3fPjCnwRM9cKF784");

interface ReportPayload {
  groupId: string;
  totalMessages: number;
  totalSizeKB: number;
  emissionsOneByteMethod: number;
  emissionsSWDMethod: number;
}

let groupStats: Record<string, { totalMessages: number; totalSizeKB: number }> =
  {};

const calculateMessageSizeKB = (message: any) => {
  if (message.text) {
    const messageSizeBytes = Buffer.byteLength(message.text, "utf8");
    return (messageSizeBytes / 1024).toFixed(3);
  } else if (message.photo) {
    const photoSizeBytes = message.photo[message.photo.length - 1].file_size;
    return (photoSizeBytes / 1024).toFixed(3);
  } else if (message.voice) {
    const voiceSizeBytes = message.voice.file_size;
    return (voiceSizeBytes / 1024).toFixed(3);
  } else if (message.video) {
    const videoSizeBytes = message.video.file_size;
    return (videoSizeBytes / 1024).toFixed(3);
  } else if (message.document) {
    const documentSizeBytes = message.document.file_size;
    return (documentSizeBytes / 1024).toFixed(3);
  } else {
    return "Tipo di messaggio non supportato";
  }
};

const { co2 } = require("@tgwf/co2");
const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });

console.log("Bot started");
bot.start((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply("This message show when you use the /start command on the bot")
);
bot.help((ctx: { reply: (arg0: string) => any }) =>
  ctx.reply("This message show when you use the /help command on the bot")
);

bot.on("message", (ctx: typeof Context) => {
  const chatId = ctx.message?.chat?.id;

  if (!groupStats[chatId as string]) {
    groupStats[chatId as string] = { totalMessages: 0, totalSizeKB: 0 };
  }

  groupStats[chatId as string].totalMessages++;
  const messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message));
  groupStats[chatId as string].totalSizeKB += messageSizeKB;

  const totalSizeBytes = groupStats[chatId as string].totalSizeKB * 1024;
  const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes);
  const emissionsSWDMethod = swd.perByte(totalSizeBytes);

  ctx.reply(
    `La dimensione del messaggio è di ${messageSizeKB} KB. Totale messaggi: ${
      groupStats[chatId].totalMessages
    }. Peso totale: ${groupStats[chatId].totalSizeKB.toFixed(
      3
    )}Kb e le emissioni di CO2 associate sono di ${emissionsOneByteMethod} g. invece con il metodo SWD sono di ${emissionsSWDMethod} g.`
  );
  ctx.reply(`Contenuto totale di ctx.message:${JSON.stringify(ctx.message)}`);
});

bot.launch();

app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
  res.send("Server is running and bot is active. grammi version aws ok double");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // const reportEndpoint = `http://co2-back.us-west-2.elasticbeanstalk.com/api/v1/reports`;
  const reportEndpoint = `http://localhost:3005/api/v1/reports`;

  const sendReport = async () => {
    for (const [chatId, stats] of Object.entries(groupStats)) {
      const totalSizeBytes = stats.totalSizeKB * 1024;
      const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes).toFixed(3);
      const emissionsSWDMethod = swd.perByte(totalSizeBytes).toFixed(3);

      try {
        // Ottieni informazioni sul gruppo
        const chatInfo = await bot.telegram.getChat(chatId);
        const groupName = chatInfo.title; // Nome del gruppo
        const participantsCount = chatInfo.membersCount; // Numero dei partecipanti

        const payload: ReportPayload = {
          groupId: chatId,
          totalMessages: stats.totalMessages,
          totalSizeKB: stats.totalSizeKB,
          emissionsOneByteMethod,
          emissionsSWDMethod,
          groupName, // Aggiungi il nome del gruppo al payload
          participantsCount, // Aggiungi il numero dei partecipanti al payload
        };

        const response = await axios.post<ReportPayload>(
          reportEndpoint,
          payload
        );
        console.log("Report inviato con successo:", response.data);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Errore durante l'invio del report if:", error.message);
        } else {
          console.error("Errore durante l'invio del report else:", error);
        }
      }
    }
    groupStats = {}; // Clear the object before sending report
  };

  cron.schedule("* * * * *", () => {
    console.log("Esecuzione del job di invio report ogni minuto !");
    sendReport();
  });
});
