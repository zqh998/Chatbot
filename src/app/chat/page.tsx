"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { TextField, Button, List, Container, InputAdornment } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FaceIcon from "@mui/icons-material/TagFaces";
import SubmitIcon from '@mui/icons-material/PublishedWithChanges';
import styles from "./styles.module.css";

interface Message {
  author: string;
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [open, setOpen] = React.useState(true);

  const keyRef = useRef({ value: "" });
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    setApiKey(keyRef.current.value);
    setOpen(false);
  };

  const sendMessage = async () => {
    if (!apiKey) {
      keyRef.current.value = "";
      setOpen(true);
      return;
    }
    if (!newMessage.trim()) return;

    const userMessage: Message = { author: "You", text: newMessage };
    const aiMessage: Message = { author: "ChatGPT", text: "in thinking..." };
    setMessages((prevMessages) => [...prevMessages, userMessage, aiMessage]);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct:nitro",
          messages: [{ role: "user", content: newMessage }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage: Message = {
        author: "ChatGPT",
        text: response.data.choices[0].message.content,
      };
      setMessages((prevMessages) => [...prevMessages.slice(0, -1), aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setNewMessage("");
  };

  return (
    <Container maxWidth="sm">
      <List>
        {messages.map((msg, index) => (
          <div key={index} className={styles.panel}>
            <div>
              <FaceIcon />
            </div>
            <div>
              <div className={styles.msgAuthor}>
                <span> {msg.author} </span>
              </div>
              <div className={styles.msgText}>
                <span> {msg.text} </span>
              </div>
            </div>
          </div>
        ))}
      </List>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        label="Message ChatGPT..."
        value={newMessage}
        size="small"
        className={styles.inputText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SubmitIcon className={styles.submitIcon} onClick={sendMessage}/>
            </InputAdornment>
          ),
        }}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <Dialog open={open} keepMounted onClose={handleClose}>
        <DialogTitle>Please input your OpenRouter API Key first</DialogTitle>
        <DialogContent>
          <DialogContentText> </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="key"
            inputRef={keyRef}
            label="OpenRouter API Key:"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button onClick={handleConfirm}>CONFIRM</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Chatbot;
