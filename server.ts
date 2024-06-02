require("dotenv").config(); // Carica le variabili di ambiente da .env
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");
const cron = require("node-cron");
const localtunnel = require("localtunnel");

const app = express();
// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf("7317510692:AAF20M_I-Gz8g8PCnbE3fPjCnwRM9cKF784");

let groupStats = {}; // Oggetto per mantenere le statistiche dei gruppi

const calculateMessageSizeKB = (message) => {
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
bot.start((ctx) =>
  ctx.reply("This message show when you use the /start command on the bot")
);
bot.help((ctx) =>
  ctx.reply("This message show when you use the /help command on the bot")
);

bot.on("message", (ctx) => {
  const chatId = ctx.message.chat.id;
  const chatTitle = ctx.message.chat.title;

  if (!groupStats[chatId]) {
    groupStats[chatId] = {
      groupName: chatTitle,
      totalMessages: 0,
      totalSizeKB: 0,
    };
  }

  groupStats[chatId].totalMessages++;
  const messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message)); // Calcola la dimensione del messaggio in KB
  groupStats[chatId].totalSizeKB += messageSizeKB;

  console.log("Contenuto del messaggio:", ctx.message);

  const totalSizeBytes = groupStats[chatId].totalSizeKB * 1024;
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

// Imposta una semplice rotta per verificare che il server sia in esecuzione
app.get("/", (req, res) => {
  res.send("Server is running and bot is active. grammi version");
});

// Avvia il server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  const tunnel = await localtunnel({ port: PORT });
  console.log(`Localtunnel is running at ${tunnel.url}`);

  const reportEndpoint = `${tunnel.url}/api/v1/reports`;

  // Funzione per inviare il report
  const sendReport = async () => {
    const timestamp = new Date().toISOString(); // Ottieni il timestamp corrente in formato ISO

    for (const [chatId, stats] of Object.entries(groupStats)) {
      const totalSizeBytes = stats.totalSizeKB * 1024;
      const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes);
      const emissionsSWDMethod = swd.perByte(totalSizeBytes);

      try {
        const response = await axios.post(reportEndpoint, {
          groupId: chatId,
          groupName: stats.groupName,
          totalMessages: stats.totalMessages,
          totalSizeKB: stats.totalSizeKB,
          emissionsOneByteMethod: emissionsOneByteMethod.toFixed(3),
          emissionsSWDMethod: emissionsSWDMethod.toFixed(3),
          timestamp, // Aggiungi il timestamp al payload del report
        });
        console.log("Report inviato con successo:", response.data);
      } catch (error) {
        console.error("Errore durante l'invio del report:", error.message);
      }
    }
  };

  // Esegui il job ogni ora
  cron.schedule("0 * * * *", () => {
    console.log("Esecuzione del job di invio report ogni ora");
    sendReport();
  });

  tunnel.on("close", () => {
    console.log("Tunnel chiuso");
  });
});
