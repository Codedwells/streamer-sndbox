import { Request, Response, Router } from "express";
import {
  listVideos,
  transcodeAndUpload,
} from "../controllers/upload.Controller";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("video"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      await transcodeAndUpload(req.file.path, req.file.originalname);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to upload video" });
    }
  }
);

router.get("/videos", async (_, res) => {
  const urls = await listVideos();
  res.status(200).json(urls);
});

export default router;
