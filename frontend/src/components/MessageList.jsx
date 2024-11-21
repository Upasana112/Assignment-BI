import React from "react";
import { 
  Card, 
  Typography, 
  Box, 
  Avatar, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Paper
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import InboxIcon from "@mui/icons-material/Inbox";

const MessageList = ({ title, messages, onClick, loading }) => (
  <Paper 
    elevation={3}
    sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      borderRadius: "12px",
      overflow: "hidden"
    }}
  >
    <Box 
      sx={{ 
        backgroundColor: "#3fbced", 
        color: "white", 
        p: 2 
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
    </Box>

    {loading ? (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        flexGrow: 1 
      }}>
        <CircularProgress color="#3fbced" />
      </Box>
    ) : messages.length === 0 ? (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          textAlign: "center",
          p: 3,
          color: "text.secondary"
        }}
      >
        <InboxIcon sx={{ fontSize: 60, color: "#3fbced", mb: 2 }} />
        <Typography variant="subtitle1">
          No {title.toLowerCase().replace(" Messages", "")} messages
        </Typography>
      </Box>
    ) : (
      <List 
        sx={{ 
          overflowY: "auto", 
          flexGrow: 1,
          p: 1 
        }}
      >
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            onClick={() => onClick(msg.userID)}
            sx={{
              cursor: "pointer",
              borderRadius: "8px",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "action.hover"
              },
              mb: 1
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "#3fbced", mr: 2 }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={`User ${msg.userID}`}
              primaryTypographyProps={{
                variant: "body1",
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

export default MessageList;