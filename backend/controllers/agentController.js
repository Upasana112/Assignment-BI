const fs = require("fs");
const { safeReadFile, safeWriteFile } = require("../helpers/fileHelper");
const messagesFilePath = "./data/userMessages.json";

const respondToUser = (req, res) => {
  const { userID, agentResponse } = req.body;

  const userMessages = safeReadFile(messagesFilePath, {});
  if (!userMessages[userID]) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = userMessages[userID];
  if (!user.chatHistory) user.chatHistory = [];
  user.chatHistory.push({ type: "agent", message: agentResponse });

  if (!user.messages[user.index]) {
    return res.status(200).json({ error: "No more messages to respond to." });
  }

  const nextMessage = user.messages[user.index];
  if (nextMessage) {
    user.chatHistory.push({ type: "user", message: nextMessage.messageBody });
    user.index++;
    safeWriteFile(messagesFilePath, userMessages);
    return res.status(200).json({ nextMessage: nextMessage.messageBody });
  }

  return res.status(200).json({ error: "No more messages to respond to." });
};

const getChatHistory = (req, res) => {
  const { userID } = req.body;

  const userMessages = safeReadFile(messagesFilePath, {});
  if (userMessages[userID] && userMessages[userID].chatHistory) {
    return res.status(200).json({ chatHistory: userMessages[userID].chatHistory });
  }

  return res.status(404).json({ error: "No chat history found." });
};

module.exports = {
  respondToUser,
  getChatHistory
};
