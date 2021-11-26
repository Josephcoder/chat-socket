const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/mesages");
const { userJoin, getCurrentUser } = require("./utils/users");

const SERVER_PORT = 4000;
const SERVER_URL = "ws://localhost:3000";
const chatName = "X-chat";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

// Define EJS
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

// Run when client connects
// Defining event emmiter by setting connection

io.on("connection", (socket) => {
  // socket variable difene every thing we are going to be using in our socket
  // We can set different events, pipelines and send data
  // Every socket connection has it's own id
  // Join room

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    console.log(user);
    socket.join(user.room);

    // Welcoming message
    socket.emit("message", formatMessage(chatName, "Welcome man"));

    // Emit message to all client except client connecting
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(chatName, `A ${user.username} join the chat`)
      );
  });

  //   Listen message
  socket.on("message", (data) => {
    const user = getCurrentUser(socket.id);

    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(user.username, data));
  });

  // Run when client disconnects
  socket.on("disconnect", () => {
    // Emit message to all clients
    io.emit("message", formatMessage(chatName, `A user has let the chat!`));
  });
});

// Start server
server.listen(SERVER_PORT, () => {
  console.log(`Socket Server is running on port ${SERVER_PORT}`);
});
