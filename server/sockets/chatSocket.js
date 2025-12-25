import User from "../models/User.js";
import Message from "../models/Message.js";

const chatSocket = (io) => {
  io.on("connection", async (socket) => {
    const { userId } = socket.handshake.query;
    if (!userId) return socket.disconnect();

    socket.join(`user_${userId}`);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // send personal message
    socket.on("sendMessage", async ({ receiverId, text }) => {
      const msg = await Message.create({
        senderId: userId,
        receiverId,
        text,
      });

      io.to(`user_${receiverId}`).emit("receiveMessage", msg);
      io.to(`user_${userId}`).emit("receiveMessage", msg);
    });

    // delete message (realtime)
    socket.on("deleteMessage", async ({ messageId }) => {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      if (msg.senderId.toString() !== userId) return;

      msg.isDeleted = true;
      msg.text = "This message was deleted";
      await msg.save();

      io.to(`user_${msg.receiverId}`).emit("messageDeleted", msg);
      io.to(`user_${msg.senderId}`).emit("messageDeleted", msg);
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false });
    });
  });
};

export default chatSocket;
