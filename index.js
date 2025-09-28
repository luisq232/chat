// index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 4000;

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Cuando un usuario escribe su nombre
  socket.on("join", (username) => {
    socket.data.username = username;
    socket.broadcast.emit("server-message", `🔔 ${username} se unió al chat`);
  });

  // Mensajes normales
  socket.on("chat-message", (text) => {
    const msg = {
      user: socket.data.username || "Anónimo",
      text,
      ts: new Date().toISOString()
    };
    io.emit("chat-message", msg); // a todos
  });

  // Indicador "está escribiendo"
  socket.on("typing", (isTyping) => {
    const user = socket.data.username || "Alguien";
    socket.broadcast.emit("typing", { user, isTyping });
  });

  socket.on("disconnect", () => {
    const user = socket.data.username;
    if (user) {
      socket.broadcast.emit("server-message", `👋 ${user} salió del chat`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
