import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files from the React client
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle any requests that don't match the above
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

export default app;
