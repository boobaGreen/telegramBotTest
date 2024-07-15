"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroupLimitGeneric = exports.postGroupLimitGeneric = exports.getTest = void 0;
// Oggetto per tenere traccia dei limiti generici dei gruppi
let groupLimitGeneric = {};
const getTest = (_req, res) => {
    console.log("test endpoint hit! wsb81");
    res.status(200).json({
        success: "Server is running and bot is active.",
    });
};
exports.getTest = getTest;
const postGroupLimitGeneric = (req, res) => {
    const { chatId, limit } = req.body;
    if (!chatId || !limit) {
        return res.status(400).json({ error: "chatId e limit sono richiesti." });
    }
    groupLimitGeneric[chatId] = limit;
    res.status(200).json({
        success: `Limite generico impostato per il gruppo ${chatId}: ${limit} KB`,
    });
};
exports.postGroupLimitGeneric = postGroupLimitGeneric;
const deleteGroupLimitGeneric = (req, res) => {
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
exports.deleteGroupLimitGeneric = deleteGroupLimitGeneric;
