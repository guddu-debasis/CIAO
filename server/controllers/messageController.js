import Message from "../models/Message.js";

// get chat history
export const getMessages = async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: userId },
      { senderId: userId, receiverId: req.user.id },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
};

// delete message (sender only)
export const deleteMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message)
    return res.status(404).json({ message: "Message not found" });

  if (message.senderId.toString() !== req.user.id)
    return res.status(403).json({ message: "Not allowed" });

  message.isDeleted = true;
  message.text = "This message was deleted";
  await message.save();

  res.json({ message: "Message deleted" });
};
