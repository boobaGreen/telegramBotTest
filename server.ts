require("dotenv").config(); // Carica le variabili di ambiente da .env
const express = require("express");
const { Telegraf } = require("telegraf");

const app = express();
// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf("7317510692:AAF20M_I-Gz8g8PCnbE3fPjCnwRM9cKF784");

let totalMessages = 0;
let totalSizeKB = 0;

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
  totalMessages++;
  const messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message)); // Calcola la dimensione del messaggio in KB
  totalSizeKB += messageSizeKB;

  console.log("Contenuto del messaggio:", ctx.message);

  const totalSizeBytes = totalSizeKB * 1024;
  const emissionsOneByteMethod = oneByte.perByte(totalSizeBytes);
  const emissionsSWDMethod = swd.perByte(totalSizeBytes);

  ctx.reply(
    `La dimensione del messaggio è di ${messageSizeKB} KB. Totale messaggi: ${totalMessages}. Peso totale: ${totalSizeKB.toFixed(
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
