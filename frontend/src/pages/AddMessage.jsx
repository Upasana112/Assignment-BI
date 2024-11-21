import React, { useState } from "react";
import { Container, Paper, Typography, Box, TextField, Button, Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import { BACKEND_URL } from "./Dashboard"; 

const AddMessage = () => {
    const [userID, setUserID] = useState("");
    const [messageBody, setMessageBody] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false); // Tracks Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'
  
    const addMessage = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/messages/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, messageBody }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add message");
        }
  
        setSnackbarMessage("Message added successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
  
        // Reset form fields
        setUserID("");
        setMessageBody("");
      } catch (error) {
        console.error("Error adding message:", error);
        setSnackbarMessage("Error adding message. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    };
  
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false); // Close the Snackbar
    };
  
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Add New Message
          </Typography>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="User ID"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Message Body"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addMessage}
              size="large"
              sx={{ alignSelf: "center", width: "50%" }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
  
        <Snackbar
          open={openSnackbar}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "center", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    );
  };

export default AddMessage;
