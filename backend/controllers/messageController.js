const fs = require("fs");
const { safeReadFile, safeWriteFile } = require("../helpers/fileHelper");
const messagesFilePath = "./data/userMessages.json";




const addMessage = (req, res) => {
  const { userID, messageBody } = req.body;
  const userMessages = safeReadFile(messagesFilePath, {});
  if (!userID || !messageBody) {
    return res.status(400).json({ error: "userID and messageBody are required." });
  }

  const timestamp = new Date().toISOString();

  if (!userMessages[userID]) {
    userMessages[userID] = { messages: [], taken: false, index: 0, chatHistory: [] };
  }

  userMessages[userID].messages.push({ timestamp, messageBody });

  safeWriteFile(messagesFilePath, userMessages);

  res.status(201).json({ message: "Message added successfully." });
};


const getMessages = (req, res) => {
  const notTaken = [];
  const taken = [];
  const userMessages = safeReadFile(messagesFilePath, {});
  for (const userID in userMessages) {
    const user = userMessages[userID];
    const firstMessage = user.messages[user.index];
    if (firstMessage || user.taken) {
      const messageData = {
        userID,
        timestamp: user.messages[user.index]?firstMessage.timestamp:null,
        messageBody: user.messages[user.index]?firstMessage.messageBody:null,
      };
      if (user.index === user.messages.length - 1 && user.taken) {
        taken.push(messageData);
      } else {
        user.taken ? taken.push(messageData) : notTaken.push(messageData);
      }
    }
  }
  
  res.json({ notTaken, taken });
};

module.exports = {
  addMessage,
  getMessages
};
