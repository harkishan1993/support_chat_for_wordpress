import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:3000"; // Update with your backend URL

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Prevent auto connection on import
  transports: ["websocket"], // Ensure WebSocket transport is used
});
