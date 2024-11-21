const express = require("express");
const router = express.Router();
const { takeUser, respondToUser, getChatHistory } = require("../controllers/agentController");

router.post("/respond", respondToUser);
router.post("/chat-history", getChatHistory);

module.exports = router;
