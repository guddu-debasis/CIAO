import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import chatSocket from "./sockets/chatSocket.js";

await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

chatSocket(io);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
