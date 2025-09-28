// public/chat.js
import "/socket.io/socket.io.js"; // asegura que exista en el bundle

const socket = io();

// UI refs
const login = document.getElementById("login");
const inputName = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");
const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const typingEl = document.getElementById("typing");

let me = null;
let typingTimer = null;

joinBtn.addEventListener("click", () => join());
inputName.addEventListener("keydown", (e) => { if (e.key === "Enter") join(); });

function join() {
  const name = inputName.value.trim();
  if (!name) return;
  me = name;
  socket.emit("join", me);
  login.classList.add("hidden");
  chat.classList.remove("hidden");
  input.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit("chat-message", text);
  input.value = "";
  emitTyping(false);
});

input.addEventListener("input", () => {
  emitTyping(true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => emitTyping(false), 1200);
});

function emitTyping(isTyping) {
  socket.emit("typing", isTyping);
}

socket.on("server-message", (text) => {
  addMessage({ text, server: true });
});

socket.on("chat-message", (msg) => {
  const time = new Date(msg.ts).toLocaleTimeString();
  addMessage({ text: `[${time}] ${msg.user}: ${msg.text}` });
});

socket.on("typing", ({ user, isTyping }) => {
  typingEl.textContent = isTyping ? `${user} está escribiendo…` : "";
});

function addMessage({ text, server = false }) {
  const li = document.createElement("li");
  if (server) li.classList.add("server");
  li.textContent = text;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
