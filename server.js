require("dotenv").config(); // Carica le variabili di ambiente da .env
var express = require("express");
var Telegraf = require("telegraf").Telegraf;
var app = express();
var bot = new Telegraf(process.env.BOT_TOKEN);
var totalMessages = 0;
var totalSizeKB = 0;
var calculateMessageSizeKB = function (message) {
    if (message.text) {
        var messageSizeBytes = Buffer.byteLength(message.text, "utf8");
        return (messageSizeBytes / 1024).toFixed(3);
    }
    else if (message.photo) {
        var photoSizeBytes = message.photo[message.photo.length - 1].file_size;
        return (photoSizeBytes / 1024).toFixed(3);
    }
    else if (message.voice) {
        var voiceSizeBytes = message.voice.file_size;
        return (voiceSizeBytes / 1024).toFixed(3);
    }
    else if (message.video) {
        var videoSizeBytes = message.video.file_size;
        return (videoSizeBytes / 1024).toFixed(3);
    }
    else if (message.document) {
        var documentSizeBytes = message.document.file_size;
        return (documentSizeBytes / 1024).toFixed(3);
    }
    else {
        return "Tipo di messaggio non supportato";
    }
};
console.log("Bot started");
bot.start(function (ctx) {
    return ctx.reply("This message show when you use the /start command on the bot");
});
bot.help(function (ctx) {
    return ctx.reply("This message show when you use the /help command on the bot");
});
bot.on("message", function (ctx) {
    totalMessages++;
    var messageSizeKB = parseFloat(calculateMessageSizeKB(ctx.message)); // Calcola la dimensione del messaggio in KB
    totalSizeKB += messageSizeKB;
    console.log("Contenuto del messaggio:", ctx.message);
    ctx.reply("La dimensione del messaggio \u00E8 di ".concat(messageSizeKB, " KB. Totale messaggi: ").concat(totalMessages, ". Peso totale: ").concat(totalSizeKB.toFixed(3), " "));
    ctx.reply("Contenuto totale di ctx.message:".concat(JSON.stringify(ctx.message)));
});
bot.launch();
// Imposta una semplice rotta per verificare che il server sia in esecuzione
app.get("/", function (req, res) {
    res.send("Server is running and bot is active.");
});
// Avvia il server Express
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
