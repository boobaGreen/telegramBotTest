// Function to check if the bot is still an administrator
const { Telegraf, Context } = require("telegraf");
export const isBotAdmin = async (ctx: typeof Context): Promise<boolean> => {
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
