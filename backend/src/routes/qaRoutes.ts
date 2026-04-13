import { Router } from "express";
import { QAController } from "../controllers/QAController";

const router = Router();
const controller = new QAController();

router.post("/ask", controller.ask);

export default router;
