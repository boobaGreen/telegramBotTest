"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupLimitController_1 = require("../controllers/groupLimitController");
const router = (0, express_1.Router)();
router.get("/test", groupLimitController_1.getTest);
router.post("/groupLimitGeneric", groupLimitController_1.postGroupLimitGeneric);
router.delete("/groupLimitGeneric/:chatId", groupLimitController_1.deleteGroupLimitGeneric);
exports.default = router;
