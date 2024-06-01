require("dotenv").config(); // Carica le variabili di ambiente da .env
const express = require("express");
const { Telegraf } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

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

  ctx.reply(
    `La dimensione del messaggio è di ${messageSizeKB} KB. Totale messaggi: ${totalMessages}. Peso totale: ${totalSizeKB.toFixed(
      3
    )} `
  );
  ctx.reply(`Contenuto totale di ctx.message:${JSON.stringify(ctx.message)}`);
});

bot.launch();

// Imposta una semplice rotta per verificare che il server sia in esecuzione
app.get("/", (req, res) => {
  res.send("Server is running and bot is active.");
});

// Avvia il server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
