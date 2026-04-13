import { Router } from "express";
import { QuizController } from "../controllers/QuizController";

const router = Router();
const controller = new QuizController();

router.post("/generate", controller.generate);
router.get("/:id", controller.getById);
router.get("/document/:documentId", controller.getByDocument);
router.post("/:id/submit", controller.submit);

export default router;
