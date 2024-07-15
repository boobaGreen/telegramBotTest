// utils/adminUtils.ts

export const getAdminIds = async (
  chatId: string,
  bot: any
): Promise<number[]> => {
  try {
    const admins = await bot.telegram.getChatAdministrators(chatId);

    return admins.map((admin: { user: { id: number } }) => admin.user.id);
  } catch (error) {
    console.error(
      "Errore durante il recupero degli ID degli amministratori:",
      error
    );
    return [];
  }
};
