const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const messageRoutes = require("./routes/messageRoutes");
const agentRoutes = require("./routes/agentRoutes");
const { safeReadFile, safeWriteFile } = require("./helpers/fileHelper");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
app.use(express.json());

const messagesFilePath = "./data/userMessages.json";

const takeUser = (req, res) => {
  const { userID } = req.body;

  const userMessages = safeReadFile(messagesFilePath, {});
  if (userMessages[userID]) {
    userMessages[userID].taken = true;
    safeWriteFile(messagesFilePath, userMessages);
    io.emit("update-taken-status", { userID });
    res.status(200).json({ message: "User marked as taken." });
  } else {
    res.status(404).json({ error: "User not found." });
  }
};


app.use("/messages", messageRoutes);
app.use("/agent", agentRoutes);
app.use("/take", takeUser);


io.on("connection", (socket) => {
  console.log("Agent connected.");
  socket.on("disconnect", () => {
    console.log("Agent disconnected.");
  });
});


const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
