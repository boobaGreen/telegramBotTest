import { Request, Response } from "express";

// Oggetto per tenere traccia dei limiti generici dei gruppi
let groupLimitGeneric: Record<string, number> = {};

export const getTest = (_req: Request, res: Response) => {
  console.log("test endpoint hit! wsb81");
  res.status(200).json({
    success: "Server is running and bot is active.",
  });
};

export const postGroupLimitGeneric = (req: Request, res: Response) => {
  const { chatId, limit } = req.body;
  if (!chatId || !limit) {
    return res.status(400).json({ error: "chatId e limit sono richiesti." });
  }

  groupLimitGeneric[chatId] = limit;
  res.status(200).json({
    success: `Limite generico impostato per il gruppo ${chatId}: ${limit} KB`,
  });
};

export const deleteGroupLimitGeneric = (req: Request, res: Response) => {
  const { chatId } = req.params;

  if (!groupLimitGeneric[chatId]) {
    return res.status(404).json({
      error: "Limite generico non trovato per il gruppo specificato.",
    });
  }

  delete groupLimitGeneric[chatId];
  res.status(200).json({
    success: `Limite generico rimosso per il gruppo ${chatId}`,
  });
};
