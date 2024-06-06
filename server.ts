const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const express = require("express");
const { Telegraf, Context } = require("telegraf");

const { co2 } = require("@tgwf/co2");
const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const getParticipantsCount = async (chatId: string) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMembersCount?chat_id=${chatId}`
    );

    console.log("Risposta dal recupero del numero di partecipanti:", response);
    return response.data.result;
  } catch (error) {
    console.error(
      "Errore durante il recupero del numero di partecipanti:",
      error
    );
    return null;
  }
};

interface GroupStats {
  totalMessages: number;
  totalSizeKB: number;
}

interface ReportPayload {
  groupId: string;
  totalMessages: number;
  totalSizeKB: number;
  emissionsOneByteMethod: number;
  emissionsSWDMethod: number;
  groupName?: string;
  participantsCount?: number;
}

let groupStats: Record<string, GroupStats> = {};

const initializeGroupStats = (chatId: string) => {
  groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
};

const calculateMessageSizeKB = (message: any) => {
  // Controlla se il messaggio è una migrazione da un altro chat
  if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
    return 0; // Ignora i messaggi di migrazione
  }

  // Controlla il tipo di messaggio
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
  } else if (message.poll) {
    // Gestisci i messaggi di tipo poll
    return "2.5"; // Imposta un valore minimo per i poll (2.5 KB, media tra 2 e 5 KB)
  } else if (message.sticker) {
    // Gestisci i messaggi di tipo sticker
    return "25"; // Imposta un valore fisso per gli sticker (25 KB, media tra 20 e 30 KB)
  } else {
    return "Tipo di messaggio non supportato";
  }
};

console.log("Bot started");
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
      `Statistiche del gruppo:\nMessaggi totali: ${
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

  if (
    chatType === "supergroup" &&
    ctx.message?.chat?.all_members_are_administrators === false
  ) {
    console.log(`Il bot è stato rimosso dal gruppo super con ID ${chatId}`);
    return;
  }

  if (!groupStats[chatId as string] && chatType === "supergroup") {
    initializeGroupStats(chatId as string);
  }

  if (groupStats[chatId as string]) {
    groupStats[chatId as string].totalMessages++;
    const messageSizeKB = parseFloat(
      calculateMessageSizeKB(ctx.message).toString()
    );
    groupStats[chatId as string].totalSizeKB += messageSizeKB;
  } else {
    console.log(`Il gruppo con ID ${chatId} non è stato inizializzato.`);
  }
});

bot.launch();

app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
  res.send("Server is running and bot is active.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  cron.schedule("* * * * *", () => {
    console.log("Esecuzione del job di invio report ogni minuto !");
    if (Object.keys(groupStats).length > 0) {
      sendReport();
      groupStats = {}; // Clear the object after sending report
    } else {
      console.log("Nessun dato da inviare.");
    }
  });
});

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

    const reportEndpoint =
      process.env.REPORT_ENDPOINT || `http://localhost:3005/api/v1/reports`;
    const response = await axios.post(
      reportEndpoint,
      payload as ReportPayload // Specifica il tipo di payload come ReportPayload
    );
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 403) {
      require("dotenv").config();

      const express = require("express");
      const { Telegraf, Context } = require("telegraf");

      const { co2 } = require("@tgwf/co2");
      const oneByte = new co2({ model: "1byte" });
      const swd = new co2({ model: "swd" });
      const axios = require("axios");
      const cron = require("node-cron");

      const app = express();
      const bot = new Telegraf(process.env.BOT_TOKEN);

      const getParticipantsCount = async (chatId: string) => {
        try {
          const response = await axios.get(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMembersCount?chat_id=${chatId}`
          );

          console.log(
            "Risposta dal recupero del numero di partecipanti :",
            response
          );
          return response.data.result;
        } catch (error) {
          console.error(
            "Errore durante il recupero del numero di partecipanti:",
            error
          );
          return null;
        }
      };

      interface GroupStats {
        totalMessages: number;
        totalSizeKB: number;
      }

      interface ReportPayload {
        groupId: string;
        totalMessages: number;
        totalSizeKB: number;
        emissionsOneByteMethod: number;
        emissionsSWDMethod: number;
        groupName?: string;
        participantsCount?: number;
      }

      let groupStats: Record<string, GroupStats> = {};

      const initializeGroupStats = (chatId: string) => {
        groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
      };

      const calculateMessageSizeKB = (message: any) => {
        // Controlla se il messaggio è una migrazione da un altro chat
        if (message.migrate_to_chat_id || message.migrate_from_chat_id) {
          return 0; // Ignora i messaggi di migrazione
        }

        // Controlla il tipo di messaggio
        if (message.text) {
          const messageSizeBytes = Buffer.byteLength(message.text, "utf8");
          return (messageSizeBytes / 1024).toFixed(3);
        } else if (message.photo) {
          const photoSizeBytes =
            message.photo[message.photo.length - 1].file_size;
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
        } else if (message.poll) {
          // Gestisci i messaggi di tipo poll
          return "2.5"; // Imposta un valore minimo per i poll (2.5 KB, media tra 2 e 5 KB)
        } else if (message.sticker) {
          // Gestisci i messaggi di tipo sticker
          return "25"; // Imposta un valore fisso per gli sticker (25 KB, media tra 20 e 30 KB)
        } else {
          return "Tipo di messaggio non supportato";
        }
      };

      console.log("Bot started");
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
            `Statistiche del gruppo:\nMessaggi totali: ${
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

        if (
          chatType === "supergroup" &&
          ctx.message?.chat?.all_members_are_administrators === false
        ) {
          console.log(
            `Il bot è stato rimosso dal gruppo super con ID ${chatId}`
          );
          return;
        }

        if (!groupStats[chatId as string] && chatType === "supergroup") {
          initializeGroupStats(chatId as string);
        }

        if (groupStats[chatId as string]) {
          groupStats[chatId as string].totalMessages++;
          const messageSizeKB = parseFloat(
            calculateMessageSizeKB(ctx.message).toString()
          );
          groupStats[chatId as string].totalSizeKB += messageSizeKB;
        } else {
          console.log(`Il gruppo con ID ${chatId} non è stato inizializzato.`);
        }
      });

      bot.launch();

      app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
        res.send("Server is running and bot is active.");
      });

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);

        cron.schedule("* * * * *", () => {
          console.log("Esecuzione del job di invio report ogni minuto !");
          if (Object.keys(groupStats).length > 0) {
            sendReport();
            groupStats = {}; // Clear the object after sending report
          } else {
            console.log("Nessun dato da inviare.");
          }
        });
      });

      const sendEmptyReport = async (
        chatId: string | undefined,
        chatInfo: any
      ) => {
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

          const reportEndpoint =
            process.env.REPORT_ENDPOINT ||
            `http://localhost:3005/api/v1/reports`;
          const response = await axios.post(
            reportEndpoint,
            payload as ReportPayload // Specifica il tipo di payload come ReportPayload
          );
        } catch (error) {
          if (
            (error as any).response &&
            (error as any).response.status === 403
          ) {
            console.error(
              "Il bot non può inviare messaggi al gruppo. È stato rimosso?"
            );
          } else {
            console.error("Errore durante l'invio del report:", error);
          }
        }
      };

      const sendReport = async () => {
        for (const [chatId, stats] of Object.entries(groupStats)) {
          const totalSizeBytes = stats.totalSizeKB * 1024;
          const emissionsOneByteMethod = oneByte
            .perByte(totalSizeBytes)
            .toFixed(7);
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

            // Invia il report con il numero di partecipanti
            const reportEndpoint =
              process.env.REPORT_ENDPOINT ||
              `http://localhost:3005/api/v1/reports`;
            const response = await axios.post(
              reportEndpoint,
              payload as ReportPayload // Specifica il tipo di payload come ReportPayload
            );

            // Azzeriamo solo i contatori dopo l'invio del report
            groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
          } catch (error) {
            if (
              (error as any).response &&
              (error as any).response.status === 403
            ) {
              console.error(
                "Il bot non può inviare messaggi al gruppo. È stato rimosso?"
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
      console.error(
        "Il bot non può inviare messaggi al gruppo. È stato rimosso?"
      );
    } else {
      console.error("Errore durante l'invio del report:", error);
    }
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

      // Invia il report con il numero di partecipanti
      const reportEndpoint =
        process.env.REPORT_ENDPOINT || `http://localhost:3005/api/v1/reports`;
      const response = await axios.post(
        reportEndpoint,
        payload as ReportPayload // Specifica il tipo di payload come ReportPayload
      );

      // Azzeriamo solo i contatori dopo l'invio del report
      groupStats[chatId] = { totalMessages: 0, totalSizeKB: 0 };
    } catch (error) {
      if ((error as any).response && (error as any).response.status === 403) {
        console.error(
          "Il bot non può inviare messaggi al gruppo. È stato rimosso?"
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
