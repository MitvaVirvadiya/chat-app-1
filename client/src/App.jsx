import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { io } from "socket.io-client";

function App() {
  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';
  const socket = useMemo(
    () =>
      io(backendUrl, {
        withCredentials: true,
      }),
    []
  );
  
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [loginMessage, setLoginMessage] = useState("")

  const sendMessageHandler = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessage("");
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  }

  const loginHandler = async () => {
    const response = await fetch(`${backendUrl}/login`, {
      credentials: "include"
    });
    
    
    location.reload()
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected ", socket.id);
      setUser(socket.id);
    });

    socket.on("welcome", (welcome) => {
      console.log(welcome);
    });

    socket.on("receive-message", (data) => {
      setMessages((messages) => [...messages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h4" component="div" gutterBottom>
          Welcome {user}, to chat app  
        </Typography>
        <Box sx={{ height: 70 }} />

        <Typography variant="h6" component="div" gutterBottom>
          Login to chat, <button onClick={loginHandler} >Click here</button>
        </Typography>
        <Typography variant="h6" component="div" gutterBottom>
          Don't worry you don't have to enter email or password - its just to add authentication layer
        </Typography>
        <Typography variant="h6" component="div" gutterBottom>
          {loginMessage}
        </Typography>

          <Box sx={{ height: 70 }} />

        <form onSubmit={joinRoomHandler}>
          <TextField
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            id="outlined-basic"
            label="RoomName"
            variant="outlined"
          />
          <Button type="submit" variant="contained" color="primary">
            Join
          </Button>
        </form>

        <Box sx={{ height: 10 }} />

        <form onSubmit={sendMessageHandler}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id="outlined-basic"
            label="Message"
            variant="outlined"
          />
          <TextField
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            id="outlined-basic"
            label="Room"
            variant="outlined"
          />
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        </form>
        <Stack>
          {messages.map((msg, idx) => (
            <Typography key={idx} variant="h6" component="div" gutterBottom>
              {msg}
            </Typography>
          ))}
        </Stack>
      </Container>
    </>
  );
}

export default App;
