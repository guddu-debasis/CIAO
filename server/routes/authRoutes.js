import express from "express";
import { signup, login, getAllUsers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * AUTH ROUTES
 */

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Get all users
router.get("/users", protect, getAllUsers);

export default router;
