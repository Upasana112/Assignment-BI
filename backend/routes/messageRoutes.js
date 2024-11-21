const express = require("express");
const router = express.Router();
const { addMessage, getMessages } = require("../controllers/messageController");

router.post("/add", addMessage);
router.get("/", getMessages);

module.exports = router;
