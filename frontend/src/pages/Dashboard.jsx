import React, { useState, useEffect, useRef, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Modal,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Paper,
  Divider,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import io from "socket.io-client";  
import MessageList from "../components/MessageList";
import cannedMessages from "../utils/CannedMessage";

export const BACKEND_URL = "http://localhost:5001";  
const socket = io(BACKEND_URL);


  const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #2196f3 30%, #21cbf3 90%)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }));
  
  const ChatPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border:"0px",
    outline:"none",
  }));
  
  const ChatMessageBox = styled(Box)(({ theme }) => ({
    borderRadius: '8px',
    padding: theme.spacing(1.5),
    margin: theme.spacing(1),
    maxWidth: '75%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  }));


const Dashboard = () => {
    const [notTakenMessages, setNotTakenMessages] = useState([]);
    const [takenMessages, setTakenMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [agentMessage, setAgentMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const chatBoxRef = useRef(null);
  
    useEffect(() => {
      socket.on("update-taken-status", ({ userID }) => {
        setNotTakenMessages((prev) => prev.filter((msg) => msg.userID !== userID));
        const takenMessage = notTakenMessages.find((msg) => msg.userID === userID);
        if (takenMessage) {
          setTakenMessages((prev) => [...prev, takenMessage]);
        }
      });
  
      return () => {
        socket.off("update-taken-status");
      };
    }, [notTakenMessages]);
  
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/messages`);
        const data = await response.json();
        setNotTakenMessages(data.notTaken);
        setTakenMessages(data.taken);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const openChat = async (userID, isTaken = false) => {
      setCurrentChat(userID);
      setChatMessages([]);
      setModalOpen(true);
  
      try {
        const response = await fetch(`${BACKEND_URL}/agent/chat-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        });
        const data = await response.json();
        setChatMessages(data.chatHistory || []);
  
        if (!isTaken) {
          const selectedMessage = notTakenMessages.find((msg) => msg.userID === userID);
          setTakenMessages((prev) => [...prev, selectedMessage]);
          setNotTakenMessages((prev) => prev.filter((msg) => msg.userID !== userID));
  
          await fetch(`${BACKEND_URL}/take`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          });
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
  
    const sendResponse = async (message) => {
      const currentMessage = message || agentMessage;
      if (!currentMessage.trim()) return;
  
      setChatMessages((prev) => [...prev, { type: "agent", message: currentMessage }]);
      setAgentMessage("");
  
      try {
        const response = await fetch(`${BACKEND_URL}/agent/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: currentChat, agentResponse: currentMessage }),
        });
  
        const data = await response.json();
        if (data.nextMessage) {
          setChatMessages((prev) => [...prev, { type: "user", message: data.nextMessage }]);
        } else if (data.message === "Waiting for the customer to send the next message.") {
          setChatMessages((prev) => [...prev, { type: "system", message: "Waiting for the customer to respond." }]);
        }
      } catch (error) {
        console.error("Error sending response:", error);
      }
    };
  
    useEffect(() => {
      fetchMessages();
  
      socket.on("new-user-message", (message) => {
        setNotTakenMessages((prev) => [...prev, message]);
      });
  
      socket.on("update-taken-status", ({ userID }) => {
        setNotTakenMessages((prev) => prev.filter((msg) => msg.userID !== userID));
      });
  
      return () => {
        socket.off("new-user-message");
        socket.off("update-taken-status");
      };
    }, []);
  
    useEffect(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, [chatMessages]);
  
    return (
        <Container maxWidth="lg">
        <StyledAppBar position="static" sx={{ mb: 3 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Agent Dashboard
            </Typography>
            <Box>
              <IconButton color="inherit" component={Link} to="/" sx={{ mr: 1 }}>
                <HomeIcon />
              </IconButton>
              <IconButton color="inherit" component={Link} to="/add-message" target="blank">
                <AddIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </StyledAppBar>
  
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChatPaper elevation={3}>
              <MessageList
                title="Not Taken Messages"
                messages={notTakenMessages}
                color="green"
                onClick={(userID) => openChat(userID, false)}
                loading={loading}
              />
            </ChatPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChatPaper elevation={3}>
              <MessageList
                title="Taken Messages"
                messages={takenMessages}
                color="green"
                onClick={(userID) => openChat(userID, true)}
                loading={loading}
              />
            </ChatPaper>
          </Grid>
        </Grid>
  
        <Modal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
          closeAfterTransition
        >
          <Fade in={modalOpen}>
            <ChatPaper
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "80vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'primary.light', 
                color: 'white',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
              }}>
                <Typography variant="h6" fontWeight={600}>
                  Chat with User {currentChat}
                </Typography>
              </Box>

              <Box
                ref={chatBoxRef}
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  p: 2,
                  backgroundColor: "#f4f6f8",
                }}
              >
                {chatMessages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: msg.type === "agent" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <ChatMessageBox
                      sx={{
                        bgcolor: msg.type === "agent" ? "primary.100" : "success.100",
                        alignSelf: msg.type === "agent" ? "flex-end" : "flex-start",
                      }}
                    >
                      {msg.type === "agent" ? <PersonIcon color="primary" /> : <ChatIcon color="secondary" />}
                      <Typography variant="body2" ml={1}>
                        {msg.message}
                      </Typography>
                    </ChatMessageBox>
                  </Box>
                ))}
              </Box>

              <Divider />

              <Box sx={{ p: 2 }}>
                <Box mb={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {useMemo(() => {
                    const randomMessages = [...cannedMessages]
                      .sort(() => Math.random() - 0.5) 
                      .slice(0, 3);
    
                    return randomMessages.map((message, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => sendResponse(message)}
                      >
                        {message}
                      </Button>
                    ));
                  }, [chatMessages])}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message..."
                    value={agentMessage}
                    onChange={(e) => setAgentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendResponse();
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={() => sendResponse()}
                    sx={{ 
                      backgroundColor: 'primary.light', 
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.main' }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </ChatPaper>
          </Fade>
        </Modal>
      </Container>
    );
  };

export default Dashboard;