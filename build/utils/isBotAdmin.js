"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBotAdmin = void 0;
// Function to check if the bot is still an administrator
const { Telegraf, Context } = require("telegraf");
const isBotAdmin = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const administrators = yield ctx.telegram.getChatAdministrators((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id);
        const botId = ctx.botInfo.id;
        return administrators.some((admin) => admin.user.id === botId);
    }
    catch (error) {
        console.error("Errore durante il recupero degli amministratori:", error);
        return false;
    }
});
exports.isBotAdmin = isBotAdmin;
