import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMessages, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:userId", protect, getMessages);
router.delete("/:id", protect, deleteMessage);

export default router;
