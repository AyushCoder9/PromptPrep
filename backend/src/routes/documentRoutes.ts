import { Router } from "express";
import multer from "multer";
import { DocumentController } from "../controllers/DocumentController";

const router = Router();
const controller = new DocumentController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

router.post("/upload", upload.single("file"), controller.upload);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.remove);

export default router;
