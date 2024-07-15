import { Router } from "express";
import {
  getTest,
  postGroupLimitGeneric,
  deleteGroupLimitGeneric,
} from "../controllers/groupLimitController";

const router = Router();

router.get("/test", getTest);
router.post("/groupLimitGeneric", postGroupLimitGeneric);
router.delete("/groupLimitGeneric/:chatId", deleteGroupLimitGeneric);

export default router;
