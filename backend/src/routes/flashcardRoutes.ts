import { Router } from "express";
import { FlashcardController } from "../controllers/FlashcardController";

const router = Router();
const controller = new FlashcardController();

router.post("/generate", controller.generate);
router.get("/document/:documentId", controller.getByDocument);
router.delete("/:id", controller.remove);

export default router;
