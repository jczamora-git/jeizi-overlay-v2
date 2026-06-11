const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");
const { createApp } = require("./createApp");

const port = Number(process.env.PORT || 3000);
const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await db.ping();
    console.log("Database connection OK");
  } catch (error) {
    console.error("Database connection failed", error);
  }
});
